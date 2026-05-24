import { SignIdentity } from "@dfinity/agent"
import {
  Contract,
  formatUnits,
  InfuraProvider,
  Interface,
  parseUnits,
  type TransactionResponse,
} from "ethers"

import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

import { ethereumService } from "../ethereum/eth/ethereum.service"
import { polygonService } from "../ethereum/polygon/polygon.service"
import { arbitrumService } from "../ethereum/arbitrum/arbitrum.service"
import { baseService } from "../ethereum/base/base.service"
import { EVMService } from "../ethereum/evm.service"
import { EthSignTransactionRequest } from "../bitcoin/idl/chain-fusion-signer.d"
import { chainFusionSignerService } from "../bitcoin/services/chain-fusion-signer.service"

import { AAVE_V3_POOL, WETH_GATEWAY, AAVE_REFERRAL_CODE } from "./constants"
import { AAVE_POOL_ABI, WETH_GATEWAY_ABI, ERC20_ABI, ATOKEN_ABI } from "./abi"
import {
  AaveReserveData,
  AaveUserPosition,
  AaveSupplyParams,
  AaveWithdrawParams,
  AaveSupplyFee,
  AaveSupportedChainId,
} from "./types"

const RAY = BigInt(10) ** BigInt(27)
const SECONDS_PER_YEAR = 31_536_000

export class AaveService {
  private getEvmService(chainId: AaveSupportedChainId): EVMService {
    switch (chainId) {
      case ChainId.ETH:
        return ethereumService
      case ChainId.POL:
        return polygonService
      case ChainId.ARB:
        return arbitrumService
      case ChainId.BASE:
        return baseService
    }
  }

  private getPoolAddress(chainId: AaveSupportedChainId): string {
    return AAVE_V3_POOL[chainId]
  }

  private getWethGatewayAddress(chainId: AaveSupportedChainId): string {
    return WETH_GATEWAY[chainId]
  }

  async getReserveData(
    chainId: AaveSupportedChainId,
    asset: string,
  ): Promise<AaveReserveData> {
    const service = this.getEvmService(chainId)
    const pool = new Contract(
      this.getPoolAddress(chainId),
      AAVE_POOL_ABI,
      service["provider"],
    )

    const data = await pool.getReserveData(asset)
    return {
      liquidityIndex: data[1],
      currentLiquidityRate: data[2],
      aTokenAddress: data[8],
      variableDebtTokenAddress: data[10],
    }
  }

  getSupplyAPY(currentLiquidityRate: bigint): number {
    const rate = Number(currentLiquidityRate) / Number(RAY)
    return ((1 + rate / SECONDS_PER_YEAR) ** SECONDS_PER_YEAR - 1) * 100
  }

  async getUserPositions(
    identity: SignIdentity,
    chainId: AaveSupportedChainId,
    assets: string[],
  ): Promise<AaveUserPosition[]> {
    const service = this.getEvmService(chainId)
    const positions: AaveUserPosition[] = []

    for (const asset of assets) {
      try {
        const reserveData = await this.getReserveData(chainId, asset)
        const aToken = new Contract(
          reserveData.aTokenAddress,
          ATOKEN_ABI,
          service["provider"],
        )

        const userAddress = await service.getAddress(identity)
        const [balance, decimals, symbol] = await Promise.all([
          aToken.balanceOf(userAddress) as Promise<bigint>,
          aToken.decimals() as Promise<number>,
          aToken.symbol() as Promise<string>,
        ])

        if (balance > BigInt(0)) {
          positions.push({
            chainId,
            asset,
            aTokenAddress: reserveData.aTokenAddress,
            symbol,
            balance,
            balanceFormatted: formatUnits(balance, decimals),
            decimals,
            supplyAPY: this.getSupplyAPY(reserveData.currentLiquidityRate),
          })
        }
      } catch {
        continue
      }
    }

    return positions
  }

  async estimateSupplyFee(
    identity: SignIdentity,
    params: AaveSupplyParams,
  ): Promise<AaveSupplyFee> {
    const service = this.getEvmService(params.chainId)
    const from = await service.getAddress(identity)
    const provider = service["provider"]

    let gasUsed: bigint
    if (params.isNativeToken) {
      const iface = new Interface(WETH_GATEWAY_ABI)
      const data = iface.encodeFunctionData("depositETH", [
        this.getPoolAddress(params.chainId),
        from,
        AAVE_REFERRAL_CODE,
      ])
      gasUsed = await provider.estimateGas({
        from,
        to: this.getWethGatewayAddress(params.chainId),
        data,
        value: parseUnits(params.amount, 18),
      })
    } else {
      const iface = new Interface(AAVE_POOL_ABI)
      const decimals = await this.getTokenDecimals(provider, params.asset)
      const data = iface.encodeFunctionData("supply", [
        params.asset,
        parseUnits(params.amount, decimals),
        from,
        AAVE_REFERRAL_CODE,
      ])
      gasUsed = await provider.estimateGas({
        from,
        to: this.getPoolAddress(params.chainId),
        data,
      })
    }

    const feeData = await provider.getFeeData()
    const maxFeePerGas = feeData.maxFeePerGas ?? BigInt(0)
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ?? BigInt(0)
    const networkFee = gasUsed * maxFeePerGas

    return { gasUsed, maxFeePerGas, maxPriorityFeePerGas, networkFee }
  }

  async supply(
    identity: SignIdentity,
    params: AaveSupplyParams,
    fee: AaveSupplyFee,
  ): Promise<TransactionResponse> {
    if (params.isNativeToken) {
      return this.supplyNativeToken(identity, params, fee)
    }
    return this.supplyERC20(identity, params, fee)
  }

  async withdraw(
    identity: SignIdentity,
    params: AaveWithdrawParams,
    fee: AaveSupplyFee,
  ): Promise<TransactionResponse> {
    if (params.isNativeToken) {
      return this.withdrawNativeToken(identity, params, fee)
    }
    return this.withdrawERC20(identity, params, fee)
  }

  private async supplyNativeToken(
    identity: SignIdentity,
    params: AaveSupplyParams,
    fee: AaveSupplyFee,
  ): Promise<TransactionResponse> {
    const service = this.getEvmService(params.chainId)
    const from = await service.getAddress(identity)
    const nonce = await service.getTransactionCount(from)

    const iface = new Interface(WETH_GATEWAY_ABI)
    const data = iface.encodeFunctionData("depositETH", [
      this.getPoolAddress(params.chainId),
      from,
      AAVE_REFERRAL_CODE,
    ])

    const request: EthSignTransactionRequest = {
      chain_id: BigInt(params.chainId),
      to: this.getWethGatewayAddress(params.chainId),
      value: parseUnits(params.amount, 18),
      data: [data],
      nonce: BigInt(nonce),
      gas: fee.gasUsed,
      max_priority_fee_per_gas: fee.maxPriorityFeePerGas,
      max_fee_per_gas: fee.maxFeePerGas,
    }

    const signed = await chainFusionSignerService.ethSignTransaction(
      identity,
      request,
    )
    const provider = service["provider"]
    const response = await provider.broadcastTransaction(signed)
    await response.wait()
    return response
  }

  private async supplyERC20(
    identity: SignIdentity,
    params: AaveSupplyParams,
    fee: AaveSupplyFee,
  ): Promise<TransactionResponse> {
    const service = this.getEvmService(params.chainId)
    const from = await service.getAddress(identity)
    const provider = service["provider"]
    const decimals = await this.getTokenDecimals(provider, params.asset)
    const amount = parseUnits(params.amount, decimals)
    const poolAddress = this.getPoolAddress(params.chainId)

    await this.ensureAllowance(
      identity,
      params.chainId,
      params.asset,
      poolAddress,
      amount,
      fee,
    )

    const nonce = await service.getTransactionCount(from)
    const iface = new Interface(AAVE_POOL_ABI)
    const data = iface.encodeFunctionData("supply", [
      params.asset,
      amount,
      from,
      AAVE_REFERRAL_CODE,
    ])

    const request: EthSignTransactionRequest = {
      chain_id: BigInt(params.chainId),
      to: poolAddress,
      value: BigInt(0),
      data: [data],
      nonce: BigInt(nonce),
      gas: fee.gasUsed,
      max_priority_fee_per_gas: fee.maxPriorityFeePerGas,
      max_fee_per_gas: fee.maxFeePerGas,
    }

    const signed = await chainFusionSignerService.ethSignTransaction(
      identity,
      request,
    )
    const response = await provider.broadcastTransaction(signed)
    await response.wait()
    return response
  }

  private async withdrawNativeToken(
    identity: SignIdentity,
    params: AaveWithdrawParams,
    fee: AaveSupplyFee,
  ): Promise<TransactionResponse> {
    const service = this.getEvmService(params.chainId)
    const from = await service.getAddress(identity)
    const provider = service["provider"]

    const reserveData = await this.getReserveData(params.chainId, params.asset)
    const gatewayAddress = this.getWethGatewayAddress(params.chainId)

    const amount =
      params.amount === "max"
        ? await this.getATokenBalance(provider, reserveData.aTokenAddress, from)
        : parseUnits(params.amount, 18)

    await this.ensureAllowance(
      identity,
      params.chainId,
      reserveData.aTokenAddress,
      gatewayAddress,
      amount,
      fee,
    )

    const iface = new Interface(WETH_GATEWAY_ABI)
    const data = iface.encodeFunctionData("withdrawETH", [
      this.getPoolAddress(params.chainId),
      amount,
      from,
    ])

    const nonce = await service.getTransactionCount(from)
    const request: EthSignTransactionRequest = {
      chain_id: BigInt(params.chainId),
      to: gatewayAddress,
      value: BigInt(0),
      data: [data],
      nonce: BigInt(nonce),
      gas: fee.gasUsed,
      max_priority_fee_per_gas: fee.maxPriorityFeePerGas,
      max_fee_per_gas: fee.maxFeePerGas,
    }

    const signed = await chainFusionSignerService.ethSignTransaction(
      identity,
      request,
    )
    const response = await provider.broadcastTransaction(signed)
    await response.wait()
    return response
  }

  private async withdrawERC20(
    identity: SignIdentity,
    params: AaveWithdrawParams,
    fee: AaveSupplyFee,
  ): Promise<TransactionResponse> {
    const service = this.getEvmService(params.chainId)
    const from = await service.getAddress(identity)
    const provider = service["provider"]
    const decimals = await this.getTokenDecimals(provider, params.asset)

    const reserveData = await this.getReserveData(params.chainId, params.asset)
    const amount =
      params.amount === "max"
        ? await this.getATokenBalance(provider, reserveData.aTokenAddress, from)
        : parseUnits(params.amount, decimals)

    const nonce = await service.getTransactionCount(from)
    const iface = new Interface(AAVE_POOL_ABI)
    const data = iface.encodeFunctionData("withdraw", [
      params.asset,
      amount,
      from,
    ])

    const request: EthSignTransactionRequest = {
      chain_id: BigInt(params.chainId),
      to: this.getPoolAddress(params.chainId),
      value: BigInt(0),
      data: [data],
      nonce: BigInt(nonce),
      gas: fee.gasUsed,
      max_priority_fee_per_gas: fee.maxPriorityFeePerGas,
      max_fee_per_gas: fee.maxFeePerGas,
    }

    const signed = await chainFusionSignerService.ethSignTransaction(
      identity,
      request,
    )
    const response = await provider.broadcastTransaction(signed)
    await response.wait()
    return response
  }

  private async ensureAllowance(
    identity: SignIdentity,
    chainId: AaveSupportedChainId,
    token: string,
    spender: string,
    amount: bigint,
    fee: AaveSupplyFee,
  ): Promise<void> {
    const service = this.getEvmService(chainId)
    const from = await service.getAddress(identity)
    const provider = service["provider"]

    const erc20 = new Contract(token, ERC20_ABI, provider)
    const currentAllowance: bigint = await erc20.allowance(from, spender)

    if (currentAllowance >= amount) return

    const iface = new Interface(ERC20_ABI)
    const data = iface.encodeFunctionData("approve", [spender, amount])

    const nonce = await service.getTransactionCount(from)
    const feeData = await provider.getFeeData()

    const request: EthSignTransactionRequest = {
      chain_id: BigInt(chainId),
      to: token,
      value: BigInt(0),
      data: [data],
      nonce: BigInt(nonce),
      gas: BigInt(60_000),
      max_priority_fee_per_gas:
        feeData.maxPriorityFeePerGas ?? fee.maxPriorityFeePerGas,
      max_fee_per_gas: feeData.maxFeePerGas ?? fee.maxFeePerGas,
    }

    const signed = await chainFusionSignerService.ethSignTransaction(
      identity,
      request,
    )
    const response = await provider.broadcastTransaction(signed)
    await response.wait()
  }

  private async getTokenDecimals(
    provider: InfuraProvider,
    token: string,
  ): Promise<number> {
    const erc20 = new Contract(token, ERC20_ABI, provider)
    return erc20.decimals()
  }

  private async getATokenBalance(
    provider: InfuraProvider,
    aToken: string,
    user: string,
  ): Promise<bigint> {
    const contract = new Contract(aToken, ATOKEN_ABI, provider)
    return contract.balanceOf(user)
  }
}

export const aaveService = new AaveService()
