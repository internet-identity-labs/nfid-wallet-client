import { SignIdentity } from "@icp-sdk/core/agent"
import {
  AbiCoder,
  Contract,
  formatUnits,
  InfuraProvider,
  Interface,
  keccak256,
  MaxUint256,
  parseUnits,
  type TransactionResponse,
  zeroPadValue,
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
import {
  AAVE_POOL_ABI,
  WETH_GATEWAY_ABI,
  ERC20_ABI,
  ATOKEN_ABI,
  POOL_NORMALIZED_INCOME_ABI,
} from "./abi"
import {
  AaveReserveData,
  AaveUserPosition,
  AaveSupplyParams,
  AaveWithdrawParams,
  AaveSupplyFee,
  AaveSupportedChainId,
  AaveSupplySnapshot,
} from "./types"

const RAY = BigInt("1" + "0".repeat(27))
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
    const userAddress = await service.getAddress(identity)
    const positions: AaveUserPosition[] = []

    for (const asset of assets) {
      try {
        const reserveData = await this.getReserveData(chainId, asset)
        const provider = service["provider"]
        const aToken = new Contract(
          reserveData.aTokenAddress,
          ATOKEN_ABI,
          provider,
        )
        const pool = new Contract(
          this.getPoolAddress(chainId),
          POOL_NORMALIZED_INCOME_ABI,
          provider,
        )

        const [
          balance,
          scaledBalance,
          decimals,
          symbol,
          currentLiquidityIndex,
        ] = await Promise.all([
          aToken.balanceOf(userAddress) as Promise<bigint>,
          aToken.scaledBalanceOf(userAddress) as Promise<bigint>,
          aToken.decimals() as Promise<number>,
          aToken.symbol() as Promise<string>,
          pool.getReserveNormalizedIncome(asset) as Promise<bigint>,
        ])

        if (balance === BigInt(0)) continue

        const supplied = this.computeSupplied(
          chainId,
          asset,
          userAddress,
          scaledBalance,
          currentLiquidityIndex,
        )
        const earned = balance > supplied ? balance - supplied : BigInt(0)

        positions.push({
          chainId,
          asset,
          aTokenAddress: reserveData.aTokenAddress,
          symbol,
          balance,
          balanceFormatted: formatUnits(balance, decimals),
          supplied,
          suppliedFormatted: formatUnits(supplied, decimals),
          earned,
          earnedFormatted: formatUnits(earned, decimals),
          decimals,
          supplyAPY: this.getSupplyAPY(reserveData.currentLiquidityRate),
        })
      } catch {
        continue
      }
    }

    return positions
  }

  // ---------------------------------------------------------------------------
  // Supply snapshot helpers
  // Stores scaledBalance + liquidityIndex at deposit time so we can recover
  // the original principal later via: principal = scaledBalance × indexAtDeposit / RAY
  // ---------------------------------------------------------------------------

  private snapshotKey(chainId: number, asset: string, user: string): string {
    return `aave:snapshot:${chainId}:${asset.toLowerCase()}:${user.toLowerCase()}`
  }

  private saveSupplySnapshot(
    chainId: AaveSupportedChainId,
    asset: string,
    user: string,
    scaledBalance: bigint,
    liquidityIndex: bigint,
  ): void {
    const snapshot: AaveSupplySnapshot = {
      scaledBalance: scaledBalance.toString(),
      liquidityIndex: liquidityIndex.toString(),
    }
    localStorage.setItem(
      this.snapshotKey(chainId, asset, user),
      JSON.stringify(snapshot),
    )
  }

  private computeSupplied(
    chainId: AaveSupportedChainId,
    asset: string,
    user: string,
    currentScaledBalance: bigint,
    currentLiquidityIndex: bigint,
  ): bigint {
    const raw = localStorage.getItem(this.snapshotKey(chainId, asset, user))
    if (!raw) {
      // No snapshot — treat entire current balance as supplied (no earned shown)
      return (currentScaledBalance * currentLiquidityIndex) / RAY
    }
    try {
      const snapshot: AaveSupplySnapshot = JSON.parse(raw)
      const indexAtDeposit = BigInt(snapshot.liquidityIndex)
      const scaledAtDeposit = BigInt(snapshot.scaledBalance)
      // principal = scaledBalance_at_deposit × liquidityIndex_at_deposit / RAY
      return (scaledAtDeposit * indexAtDeposit) / RAY
    } catch {
      return (currentScaledBalance * currentLiquidityIndex) / RAY
    }
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
      const amount = parseUnits(params.amount, decimals)
      const poolAddress = this.getPoolAddress(params.chainId)

      const erc20 = new Contract(params.asset, ERC20_ABI, provider)
      const currentAllowance: bigint = await erc20.allowance(from, poolAddress)

      let approveGas = BigInt(0)
      if (currentAllowance < amount) {
        const approveData = new Interface(ERC20_ABI).encodeFunctionData(
          "approve",
          [poolAddress, amount],
        )
        approveGas = await provider.estimateGas({
          from,
          to: params.asset,
          data: approveData,
        })
      }

      const supplyData = iface.encodeFunctionData("supply", [
        params.asset,
        amount,
        from,
        AAVE_REFERRAL_CODE,
      ])

      const supplyGas = await this.estimateGasWithAllowanceOverride(
        provider,
        from,
        poolAddress,
        supplyData,
        params.asset,
      )

      gasUsed = approveGas + supplyGas
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

    // Save snapshot so getUserPositions() can compute earned later
    const aToken = new Contract(
      (await this.getReserveData(params.chainId, params.asset)).aTokenAddress,
      ATOKEN_ABI,
      provider,
    )
    const pool = new Contract(poolAddress, POOL_NORMALIZED_INCOME_ABI, provider)
    const [scaledBalance, liquidityIndex] = await Promise.all([
      aToken.scaledBalanceOf(from) as Promise<bigint>,
      pool.getReserveNormalizedIncome(params.asset) as Promise<bigint>,
    ])
    this.saveSupplySnapshot(
      params.chainId,
      params.asset,
      from,
      scaledBalance,
      liquidityIndex,
    )

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

  // Estimates gas for a supply call by overriding the ERC-20 allowance slot in
  // the simulation so the on-chain check doesn't revert with "exceeds allowance".
  // Uses the OpenZeppelin storage layout (_allowances at slot 1).
  private async estimateGasWithAllowanceOverride(
    provider: InfuraProvider,
    from: string,
    to: string,
    data: string,
    token: string,
  ): Promise<bigint> {
    // OZ ERC-20: slot 1 is _allowances mapping
    // storageKey = keccak256(spender ++ keccak256(owner ++ slot))
    const abiCoder = AbiCoder.defaultAbiCoder()
    const innerSlot = keccak256(
      abiCoder.encode(["address", "uint256"], [from, 1]),
    )
    const storageKey = keccak256(
      abiCoder.encode(["address", "bytes32"], [to, innerSlot]),
    )
    const maxAllowance = zeroPadValue("0x" + MaxUint256.toString(16), 32)

    try {
      const result = await provider.send("eth_estimateGas", [
        { from, to, data },
        "latest",
        { [token]: { stateDiff: { [storageKey]: maxAllowance } } },
      ])
      return BigInt(result)
    } catch {
      // Fallback: AAVE v3 ERC-20 supply uses ~250 000 gas consistently
      return BigInt(250_000)
    }
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
