import { SignIdentity } from "@icp-sdk/core/agent"
import BigNumber from "bignumber.js"
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
import { FT } from "../ft/ft"
import { ETH_NATIVE_ID, EVM_NATIVE } from "@nfid/integration/token/constants"
import { ttlCacheService } from "@nfid/client-db"

export const EARN_POSITIONS_CACHE_NAME = "EarnPositions"
export const AAVE_SUPPORTED_TOKENS_CACHE_NAME = "AaveSupportedTokens"

import { ethereumService } from "../ethereum/eth/ethereum.service"
import { withRetry } from "../ethereum/utils"
import { polygonService } from "../ethereum/polygon/polygon.service"
import { arbitrumService } from "../ethereum/arbitrum/arbitrum.service"
import { baseService } from "../ethereum/base/base.service"
import { EVMService } from "../ethereum/evm.service"
import { EthSignTransactionRequest } from "../bitcoin/idl/chain-fusion-signer.d"
import { chainFusionSignerService } from "../bitcoin/services/chain-fusion-signer.service"

import {
  AAVE_V3_POOL,
  WETH_GATEWAY,
  AAVE_REFERRAL_CODE,
  WRAPPED_NATIVE_TOKEN,
} from "./constants"
import { AAVE_POOL_ABI, WETH_GATEWAY_ABI, ERC20_ABI, ATOKEN_ABI } from "./abi"
import {
  AaveReserveData,
  AaveUserPosition,
  AaveSupplyParams,
  AaveWithdrawParams,
  AaveSupplyFee,
  AaveSupportedChainId,
  AaveFeeData,
  AaveWithdrawFee,
} from "./types"
import {
  CKETH_LEDGER_CANISTER_ID,
  ETH_DECIMALS,
  POLYGON_ADDRESS,
  TRIM_ZEROS,
} from "@nfid/integration/token/constants"
import { exchangeRateService } from "@nfid/integration"
import { polygonErc20Service } from "../ethereum/polygon/pol-erc20.service"
import { delay } from "frontend/features/fungible-token/utils"

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

  async getSupportedTokens(
    tokens: FT[],
    chains: AaveSupportedChainId[],
    refetch?: boolean,
  ): Promise<FT[]> {
    return ttlCacheService.getOrFetch<FT[]>(
      AAVE_SUPPORTED_TOKENS_CACHE_NAME,
      async () => {
        const reservesByChain = await Promise.all(
          chains.map(async (chainId) => {
            const service = this.getEvmService(chainId)
            const pool = new Contract(
              this.getPoolAddress(chainId),
              AAVE_POOL_ABI,
              service["provider"],
            )
            const list: string[] = await pool.getReservesList()
            return [chainId, list.map((a) => a.toLowerCase())] as const
          }),
        )
        const reserveMap = new Map(reservesByChain)

        return tokens.filter((t) => {
          const chainId = t.getChainId() as AaveSupportedChainId
          const reserves = reserveMap.get(chainId)
          if (!reserves) return false
          const addr = t.getTokenAddress()
          const underlying =
            addr === ETH_NATIVE_ID || addr === EVM_NATIVE
              ? WRAPPED_NATIVE_TOKEN[chainId]?.toLowerCase()
              : addr.toLowerCase()
          return !!underlying && reserves.includes(underlying)
        })
      },
      300 * 1000,
      {
        forceRefetch: Boolean(refetch),
        serialize: (fts) =>
          JSON.stringify(
            fts?.map((t) => ({
              chainId: t.getChainId(),
              address: t.getTokenAddress(),
            })),
          ),
        deserialize: (stored) => {
          const ids: Array<{ chainId: ChainId; address: string }> = JSON.parse(
            stored as string,
          )
          return ids
            .map((id) =>
              tokens.find(
                (t) =>
                  t.getChainId() === id.chainId &&
                  t.getTokenAddress() === id.address,
              ),
            )
            .filter((t): t is FT => t !== undefined)
        },
      },
    )
  }

  public async getReserveData(
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

  public getSupplyAPY(currentLiquidityRate: bigint): string {
    const rate = Number(currentLiquidityRate) / Number(RAY)
    return `${(
      ((1 + rate / SECONDS_PER_YEAR) ** SECONDS_PER_YEAR - 1) *
      100
    ).toFixed(2)}%`
  }

  public async getUserPositions(
    tokens: FT[],
    supportedChains: AaveSupportedChainId[],
    address: string,
    refetch?: boolean,
  ): Promise<AaveUserPosition[]> {
    return ttlCacheService.getOrFetch<AaveUserPosition[]>(
      `${EARN_POSITIONS_CACHE_NAME}_${address}`,
      async () => {
        const tokensByChain = new Map<AaveSupportedChainId, Map<string, FT>>()
        for (const chain of supportedChains) {
          tokensByChain.set(chain, new Map())
        }
        for (const token of tokens) {
          const chainId = token.getChainId() as AaveSupportedChainId
          if (!tokensByChain.has(chainId)) continue
          const tokenAddress = (
            token.getTokenAddress() === ETH_NATIVE_ID ||
            token.getTokenAddress() === EVM_NATIVE
              ? WRAPPED_NATIVE_TOKEN[chainId]
              : token.getTokenAddress()
          ).toLowerCase()
          const chainMap = tokensByChain.get(chainId)!
          if (!chainMap.has(tokenAddress)) chainMap.set(tokenAddress, token)
        }

        const results = await Promise.all(
          supportedChains.map(async (chainId, index) => {
            await delay(index * 500)
            return this.getPositionsForChain(
              chainId,
              tokensByChain.get(chainId)!,
              address,
            )
          }),
        )

        return results.flat()
      },
      300 * 1000,
      {
        forceRefetch: Boolean(refetch),
        serialize: (positions) =>
          JSON.stringify(
            positions?.map((p) => ({ ...p, balance: p.balance.toString() })),
          ),
        deserialize: (stored) => {
          const data: Array<
            Omit<AaveUserPosition, "balance"> & { balance: string }
          > = JSON.parse(stored as string)
          return data.map((p) => ({ ...p, balance: BigInt(p.balance) }))
        },
      },
    )
  }

  private async getPositionsForChain(
    chainId: AaveSupportedChainId,
    tokenMap: Map<string, FT>,
    address: string,
  ): Promise<AaveUserPosition[]> {
    const service = this.getEvmService(chainId)
    const provider = service["provider"]
    const assets = Array.from(tokenMap.keys())

    const positions = await Promise.all(
      assets.map(async (asset, index) => {
        await delay(index * 350)

        const token = tokenMap.get(asset)!
        try {
          const reserveData = await withRetry(() =>
            this.getReserveData(chainId, asset),
          )
          const aToken = new Contract(
            reserveData.aTokenAddress,
            ATOKEN_ABI,
            provider,
          )

          const balance = await withRetry(() => aToken.balanceOf(address))

          const balanceAmount = formatUnits(balance, token.getTokenDecimals())

          if (balance <= BigInt(0)) return null

          return {
            chainId,
            asset,
            aTokenAddress: reserveData.aTokenAddress,
            symbol: token.getTokenSymbol(),
            balance,
            balanceFormatted: `${balanceAmount} ${token.getTokenSymbol()}`,
            balanceUsdFormatted: `${token.getTokenRateFormatted(balanceAmount)}`,
            decimals: token.getTokenDecimals(),
            supplyAPY: this.getSupplyAPY(reserveData.currentLiquidityRate),
          }
        } catch (e) {
          console.error(
            `getPositionsForChain failed for ${chainId}:${asset}`,
            e,
          )
          return null
        }
      }),
    )

    return positions.filter((p): p is AaveUserPosition => p !== null)
  }

  getTotalUsdValue(positions?: AaveUserPosition[]): {
    value: string
    dayChangePercent: string
    dayChange: string
    dayChangePositive: boolean
    value24h: string
  } {
    const total = positions?.reduce((sum, pos) => {
      const num = parseFloat(
        (pos.balanceUsdFormatted ?? "").replace(" USD", ""),
      )
      return isNaN(num) ? sum : sum + num
    }, 0)
    const value = (total ?? 0).toFixed(2)

    return {
      value,
      dayChangePercent: "0.00",
      dayChange: "0.00",
      dayChangePositive: true,
      value24h: value,
    }
  }

  public async estimateSupplyFee(
    identity: SignIdentity,
    decimals: number,
    params: AaveSupplyParams,
    isMaxAmount = false,
  ): Promise<AaveFeeData> {
    const service = this.getEvmService(params.chainId)
    const from = await service.getAddress(identity)
    const provider = service["provider"]

    let gasUsed: bigint
    let adjustedAmount: string | undefined
    if (params.isNativeToken) {
      const iface = new Interface(WETH_GATEWAY_ABI)
      const gatewayAddress = this.getWethGatewayAddress(params.chainId)
      const data = iface.encodeFunctionData("depositETH", [
        this.getPoolAddress(params.chainId),
        from,
        AAVE_REFERRAL_CODE,
      ])
      gasUsed = await withRetry(() =>
        provider.estimateGas({
          from,
          to: gatewayAddress,
          data,
          value: parseUnits(params.amount, ETH_DECIMALS),
        }),
      )

      if (isMaxAmount) {
        const feeData = await withRetry(() => provider.getFeeData())

        const maxFeePerGas = feeData.maxFeePerGas ?? BigInt(0)
        // 20% buffer to cover gas price fluctuations between estimate and execution
        const gasCost = (gasUsed * maxFeePerGas * BigInt(12)) / BigInt(10)
        const adjusted = parseUnits(params.amount, ETH_DECIMALS) - gasCost
        if (adjusted > BigInt(0)) {
          adjustedAmount = formatUnits(adjusted, ETH_DECIMALS)
        }
      }
    } else {
      const iface = new Interface(AAVE_POOL_ABI)
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
        approveGas = await withRetry(() =>
          provider.estimateGas({ from, to: params.asset, data: approveData }),
        )
      }
      const data = iface.encodeFunctionData("supply", [
        params.asset,
        amount,
        from,
        AAVE_REFERRAL_CODE,
      ])
      const supplyGasEstimate = await this.estimateGasWithAllowanceOverride(
        provider,
        from,
        poolAddress,
        data,
        params.asset,
      )
      // 20% buffer — the override-based estimate can undercount cold-storage costs of a first-time deposit into a reserve
      const supplyGas = (supplyGasEstimate * BigInt(120)) / BigInt(100)

      gasUsed = approveGas + supplyGas
    }

    const feeData = await withRetry(() => provider.getFeeData())
    const maxFeePerGas = feeData.maxFeePerGas ?? BigInt(0)
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ?? BigInt(0)
    const networkFee = gasUsed * maxFeePerGas
    const formattedFee = new BigNumber(networkFee).dividedBy(
      new BigNumber(10).pow(ETH_DECIMALS),
    )

    let feeTokenRate
    let feeToken
    if (params.chainId === ChainId.POL) {
      feeToken = "POL"
      const data = await polygonErc20Service.getUSDPrices([POLYGON_ADDRESS])
      feeTokenRate = data[0].price
    } else {
      feeToken = "ETH"
      const data = await exchangeRateService.usdPriceForICRC1(
        CKETH_LEDGER_CANISTER_ID,
      )
      feeTokenRate = data?.value
    }

    return {
      rawFee: { gasUsed, maxFeePerGas, maxPriorityFeePerGas, networkFee },
      feeFormatted: {
        fee: `${formattedFee.toFixed(ETH_DECIMALS).replace(TRIM_ZEROS, "")} ${feeToken}`,
        feeUsd: `${formattedFee.multipliedBy(feeTokenRate!).toFixed(2)} USD`,
      },
      adjustedAmount,
    }
  }

  public async estimateWithdrawFee(
    identity: SignIdentity,
    decimals: number,
    params: AaveWithdrawParams,
  ): Promise<AaveFeeData> {
    const service = this.getEvmService(params.chainId)
    const from = await service.getAddress(identity)
    const provider = service["provider"]

    const reserveData = await this.getReserveData(params.chainId, params.asset)
    const aTokenAddress = reserveData.aTokenAddress

    let gasUsed: bigint
    if (params.isNativeToken) {
      const gatewayAddress = this.getWethGatewayAddress(params.chainId)
      const aToken = new Contract(aTokenAddress, ATOKEN_ABI, provider)
      const aTokenBalance = await withRetry(() => aToken.balanceOf(from))
      const withdrawAmount =
        params.amount === "max"
          ? aTokenBalance
          : parseUnits(params.amount, ETH_DECIMALS)

      const currentAllowance: bigint = await new Contract(
        aTokenAddress,
        ERC20_ABI,
        provider,
      ).allowance(from, gatewayAddress)

      let approveGas = BigInt(0)
      if (currentAllowance < withdrawAmount) {
        const approveData = new Interface(ERC20_ABI).encodeFunctionData(
          "approve",
          [gatewayAddress, withdrawAmount],
        )
        approveGas = await withRetry(() =>
          provider.estimateGas({ from, to: aTokenAddress, data: approveData }),
        )
        approveGas = (approveGas * BigInt(120)) / BigInt(100)
      }

      const withdrawData = new Interface(WETH_GATEWAY_ABI).encodeFunctionData(
        "withdrawETH",
        [this.getPoolAddress(params.chainId), withdrawAmount, from],
      )
      const withdrawGas = await provider
        .estimateGas({ from, to: gatewayAddress, data: withdrawData })
        .catch(() => BigInt(200_000))

      gasUsed = approveGas + withdrawGas
    } else {
      const withdrawAmount =
        params.amount === "max"
          ? await this.getATokenBalance(provider, aTokenAddress, from)
          : parseUnits(params.amount, decimals)

      const withdrawData = new Interface(AAVE_POOL_ABI).encodeFunctionData(
        "withdraw",
        [params.asset, withdrawAmount, from],
      )
      gasUsed = await withRetry(() =>
        provider.estimateGas({
          from,
          to: this.getPoolAddress(params.chainId),
          data: withdrawData,
        }),
      )
    }

    const feeData = await withRetry(() => provider.getFeeData())
    const maxFeePerGas = feeData.maxFeePerGas ?? BigInt(0)
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ?? BigInt(0)
    const networkFee = gasUsed * maxFeePerGas
    const formattedFee = new BigNumber(networkFee).dividedBy(
      new BigNumber(10).pow(ETH_DECIMALS),
    )

    let feeTokenRate
    let feeToken
    if (params.chainId === ChainId.POL) {
      feeToken = "POL"
      const data = await polygonErc20Service.getUSDPrices([POLYGON_ADDRESS])
      feeTokenRate = data[0].price
    } else {
      feeToken = "ETH"
      const data = await exchangeRateService.usdPriceForICRC1(
        CKETH_LEDGER_CANISTER_ID,
      )
      feeTokenRate = data?.value
    }

    return {
      rawFee: { gasUsed, maxFeePerGas, maxPriorityFeePerGas, networkFee },
      feeFormatted: {
        fee: `${formattedFee.toFixed(ETH_DECIMALS).replace(TRIM_ZEROS, "")} ${feeToken}`,
        feeUsd: `${formattedFee.multipliedBy(feeTokenRate!).toFixed(2)} USD`,
      },
    }
  }

  public async supply(
    identity: SignIdentity,
    decimals: number,
    params: AaveSupplyParams,
    fee: AaveSupplyFee,
  ): Promise<TransactionResponse> {
    if (params.isNativeToken) {
      return this.supplyNativeToken(identity, params, fee)
    }
    return this.supplyERC20(identity, decimals, params, fee)
  }

  public async withdraw(
    identity: SignIdentity,
    decimals: number,
    params: AaveWithdrawParams,
    fee: AaveWithdrawFee,
  ): Promise<TransactionResponse> {
    if (params.isNativeToken) {
      return this.withdrawNativeToken(identity, params, fee)
    }
    return this.withdrawERC20(identity, decimals, params, fee)
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
      value: parseUnits(params.amount, ETH_DECIMALS),
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
    const response = await withRetry(() =>
      provider.broadcastTransaction(signed),
    )
    await withRetry(() => response.wait())
    return response
  }

  private async supplyERC20(
    identity: SignIdentity,
    decimals: number,
    params: AaveSupplyParams,
    fee: AaveSupplyFee,
  ): Promise<TransactionResponse> {
    const service = this.getEvmService(params.chainId)
    const from = await service.getAddress(identity)
    const provider = service["provider"]
    const amount = parseUnits(params.amount, decimals)
    const poolAddress = this.getPoolAddress(params.chainId)

    const approvedNonce = await this.ensureAllowance(
      identity,
      params.chainId,
      params.asset,
      poolAddress,
      amount,
      fee,
    )

    const nonce = approvedNonce ?? (await service.getTransactionCount(from))
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
    const response = await withRetry(() =>
      provider.broadcastTransaction(signed),
    )
    await withRetry(() => response.wait())
    return response
  }

  private async withdrawNativeToken(
    identity: SignIdentity,
    params: AaveWithdrawParams,
    fee: AaveWithdrawFee,
  ): Promise<TransactionResponse> {
    const service = this.getEvmService(params.chainId)
    const from = await service.getAddress(identity)
    const provider = service["provider"]

    const wrappedAsset = WRAPPED_NATIVE_TOKEN[params.chainId]
    const reserveData = await this.getReserveData(params.chainId, wrappedAsset)
    const gatewayAddress = this.getWethGatewayAddress(params.chainId)

    const amount =
      params.amount === "max"
        ? MaxUint256
        : parseUnits(params.amount, ETH_DECIMALS)

    const approvedNonce = await this.ensureAllowance(
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

    // Re-estimate after allowance is set — pre-estimate falls back to 200k
    // because aToken transferFrom reverts without allowance in simulation
    const withdrawGasEstimate = await withRetry(() =>
      provider.estimateGas({ from, to: gatewayAddress, data }),
    )
    const withdrawGas = (withdrawGasEstimate * BigInt(120)) / BigInt(100)

    const gasCost = withdrawGas * fee.maxFeePerGas
    const walletBalance = await provider.getBalance(from)
    if (walletBalance < gasCost) {
      throw new Error(
        `Insufficient ETH for gas. Required: ${formatUnits(gasCost, ETH_DECIMALS)} ETH`,
      )
    }

    const nonce = approvedNonce ?? (await service.getTransactionCount(from))
    const request: EthSignTransactionRequest = {
      chain_id: BigInt(params.chainId),
      to: gatewayAddress,
      value: BigInt(0),
      data: [data],
      nonce: BigInt(nonce),
      gas: withdrawGas,
      max_priority_fee_per_gas: fee.maxPriorityFeePerGas,
      max_fee_per_gas: fee.maxFeePerGas,
    }

    const signed = await chainFusionSignerService.ethSignTransaction(
      identity,
      request,
    )
    const response = await withRetry(() =>
      provider.broadcastTransaction(signed),
    )
    await withRetry(() => response.wait())
    return response
  }

  private async withdrawERC20(
    identity: SignIdentity,
    decimals: number,
    params: AaveWithdrawParams,
    fee: AaveWithdrawFee,
  ): Promise<TransactionResponse> {
    const service = this.getEvmService(params.chainId)
    const from = await service.getAddress(identity)
    const provider = service["provider"]

    const amount =
      params.amount === "max" ? MaxUint256 : parseUnits(params.amount, decimals)

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
    const response = await withRetry(() =>
      provider.broadcastTransaction(signed),
    )
    await withRetry(() => response.wait())
    return response
  }

  private async ensureAllowance(
    identity: SignIdentity,
    chainId: AaveSupportedChainId,
    token: string,
    spender: string,
    amount: bigint,
    fee: AaveSupplyFee | AaveWithdrawFee,
  ): Promise<number | undefined> {
    const service = this.getEvmService(chainId)
    const from = await service.getAddress(identity)
    const provider = service["provider"]

    const erc20 = new Contract(token, ERC20_ABI, provider)
    const currentAllowance: bigint = await erc20.allowance(from, spender)

    if (currentAllowance >= amount) return undefined

    const iface = new Interface(ERC20_ABI)
    const data = iface.encodeFunctionData("approve", [spender, amount])

    const [nonce, feeData, estimatedGas] = await Promise.all([
      service.getTransactionCount(from),
      withRetry(() => provider.getFeeData()),
      withRetry(() => provider.estimateGas({ from, to: token, data })),
    ])
    const gas = (estimatedGas * BigInt(120)) / BigInt(100)

    const request: EthSignTransactionRequest = {
      chain_id: BigInt(chainId),
      to: token,
      value: BigInt(0),
      data: [data],
      nonce: BigInt(nonce),
      gas,
      max_priority_fee_per_gas:
        feeData.maxPriorityFeePerGas ?? fee.maxPriorityFeePerGas,
      max_fee_per_gas: feeData.maxFeePerGas ?? fee.maxFeePerGas,
    }

    const signed = await chainFusionSignerService.ethSignTransaction(
      identity,
      request,
    )
    const response = await withRetry(() =>
      provider.broadcastTransaction(signed),
    )
    await withRetry(() => response.wait())

    // Return the next nonce directly instead of re-querying the RPC node —
    // some providers lag behind their own just-confirmed transactions, which
    // can hand back the approve tx's nonce again and cause "nonce too low".
    return nonce + 1
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
      const result = await withRetry(() =>
        provider.send("eth_estimateGas", [
          { from, to, data },
          "latest",
          { [token]: { stateDiff: { [storageKey]: maxAllowance } } },
        ]),
      )
      return BigInt(result)
    } catch {
      // Fallback: AAVE v3 ERC-20 supply uses ~250 000 gas consistently
      return BigInt(250_000)
    }
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
