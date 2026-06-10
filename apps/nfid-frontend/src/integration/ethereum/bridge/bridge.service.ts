import BigNumber from "bignumber.js"
import { SignIdentity } from "@icp-sdk/core/agent"
import { Contract, Interface, JsonRpcProvider } from "ethers"

import {
  ETH_DECIMALS,
  ETH_NATIVE_ID,
  EVM_NATIVE,
  TRIM_ZEROS,
} from "@nfid/integration/token/constants"
import {
  ChainId,
  isEvmToken,
  isTestnetToken,
} from "@nfid/integration/token/icrc1/enum/enums"
import { FT } from "frontend/integration/ft/ft"
import { ethereumService } from "../eth/ethereum.service"
import { EthSignTransactionRequest } from "frontend/integration/bitcoin/idl/chain-fusion-signer.d"
import { chainFusionSignerService } from "frontend/integration/bitcoin/services/chain-fusion-signer.service"

import { createClient } from "@lifi/sdk"
import { EthereumProvider } from "@lifi/sdk-provider-ethereum"
import { createWalletClient, http } from "viem"
import { toAccount } from "viem/accounts"
import { mainnet } from "viem/chains"
import { getQuote, getStatus, getTokens } from "@lifi/sdk"
import { EVM_ZERO_ADDRESS } from "./constants"
import { EstimatedBridge } from "./types"

class BridgeService {
  private identity: SignIdentity | null = null
  private address: string | null = null
  private account: ReturnType<typeof toAccount> | null = null
  private client: ReturnType<typeof createClient> | null = null
  private pendingQuote: Awaited<ReturnType<typeof getQuote>> | null = null
  private supportedTokensCache: Set<string> | null = null

  private async signTransaction(transaction: any): Promise<`0x${string}`> {
    const request: EthSignTransactionRequest = {
      to: transaction.to as string,
      value: transaction.value ?? BigInt(0),
      data: transaction.data ? [transaction.data as string] : [],
      nonce: BigInt(transaction.nonce ?? 0),
      gas: transaction.gas ?? BigInt(200_000),
      max_priority_fee_per_gas:
        transaction.maxPriorityFeePerGas ?? BigInt(2_000_000_000),
      max_fee_per_gas: transaction.maxFeePerGas ?? BigInt(10_000_000_000),
      chain_id: BigInt(transaction.chainId ?? ChainId.ETH),
    }
    return chainFusionSignerService.ethSignTransaction(
      this.identity!,
      request,
    ) as Promise<`0x${string}`>
  }

  private buildAccount() {
    this.account = toAccount({
      address: this.address! as `0x${string}`,
      async signMessage() {
        throw new Error("signMessage not supported")
      },
      signTransaction: (tx) => this.signTransaction(tx),
      async signTypedData() {
        throw new Error("signTypedData not supported")
      },
    })
  }

  public async init(identity: SignIdentity) {
    const address = await ethereumService.getAddress(identity)
    this.identity = identity
    this.address = address
    if (!this.account) this.buildAccount()
    if (this.client) return this.client

    this.client = createClient({
      integrator: "NFID_Wallet",
      apiKey: BRIDGE_API_KEY,
      providers: [
        EthereumProvider({
          getWalletClient: () =>
            Promise.resolve(
              createWalletClient({
                account: this.account!,
                chain: mainnet,
                transport: http(
                  `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
                ),
              }),
            ) as any,
        }),
      ],
    })
    return this.client
  }

  public async getQuote(
    fromChain: number,
    toChain: number,
    fromToken: string,
    toToken: string,
    fromAmount: string,
    decimals: number,
    isMaxAmount: boolean,
  ): Promise<EstimatedBridge> {
    const fromTokenAddress =
      fromToken === EVM_NATIVE || fromToken === ETH_NATIVE_ID
        ? EVM_ZERO_ADDRESS
        : fromToken
    const toTokenAddress =
      toToken === EVM_NATIVE || toToken === ETH_NATIVE_ID
        ? EVM_ZERO_ADDRESS
        : toToken

    let amount = new BigNumber(fromAmount)
      .multipliedBy(10 ** decimals)
      .toString()

    if (isMaxAmount) {
      const probeQuote = await getQuote(this.client!, {
        fromAddress: this.address!,
        fromChain,
        toChain,
        fromToken: fromTokenAddress,
        toToken: toTokenAddress,
        fromAmount: amount,
      })

      const probeTx = probeQuote.transactionRequest
      if (probeTx?.gasLimit && BigInt(probeTx.value ?? 0) > BigInt(0)) {
        const provider = this.getProvider(fromChain)
        const feeData = await provider.getFeeData()
        const maxFeePerGas = feeData.maxFeePerGas ?? BigInt(10_000_000_000)
        // 20% buffer to cover gas price fluctuations between quote and execution
        const gasCost =
          (BigInt(probeTx.gasLimit) * maxFeePerGas * BigInt(12)) / BigInt(10)
        const adjusted = BigInt(amount) - gasCost
        if (adjusted > BigInt(0)) amount = adjusted.toString()
      }
    }

    const quote = await getQuote(this.client!, {
      fromAddress: this.address!,
      fromChain,
      toChain,
      fromToken: fromTokenAddress,
      toToken: toTokenAddress,
      fromAmount: amount,
    })
    this.pendingQuote = quote

    await this.validateTransaction()

    const quoteEstimate = quote.estimate
    const quoteAction = quote.action
    const gasCosts = quoteEstimate.gasCosts ?? []
    const sendGasCost = gasCosts.find((g) => g.type === "SEND") ?? gasCosts[0]
    const sendGasDecimals = sendGasCost?.token?.decimals ?? ETH_DECIMALS
    const feeCosts = quoteEstimate.feeCosts ?? []
    const totalUsd = (
      Number(sendGasCost?.amountUSD ?? 0) +
      feeCosts.reduce((sum, f) => sum + Number(f.amountUSD ?? 0), 0)
    ).toFixed(2)

    return {
      rawFee: sendGasCost?.amount ? BigInt(sendGasCost.amount) : BigInt(0),
      sourceCost: `${(Number(sendGasCost?.amount ?? 0) / 10 ** sendGasDecimals).toFixed(sendGasDecimals).replace(TRIM_ZEROS, "")} ${sendGasCost?.token?.symbol ?? "ETH"}`,
      sourceUsdCost: `${Number(sendGasCost?.amountUSD ?? 0).toFixed(2)} USD`,
      totalUsdCost: `${totalUsd} USD`,

      amountTo: `${(Number(quoteEstimate.toAmountMin ?? 0.0) / 10 ** quoteAction.toToken.decimals).toFixed(quoteAction.toToken.decimals).replace(TRIM_ZEROS, "")} ${quoteAction.toToken.symbol}`,
      amountToUsd: `${Number(quoteEstimate.toAmountUSD).toFixed(2) || "0.00"} USD`,

      amountFrom: `${(Number(quoteEstimate.fromAmount ?? 0.0) / 10 ** quoteAction.fromToken.decimals).toFixed(quoteAction.fromToken.decimals).replace(TRIM_ZEROS, "")} ${quoteAction.fromToken.symbol}`,
      amountFromUsd: `${Number(quoteEstimate.fromAmountUSD).toFixed(2) || "0.00"} USD`,
      protocolFee: feeCosts.map((f) => {
        return {
          amount: `${Number(f.amount) / 10 ** f.token.decimals} ${f.token.symbol}`,
          amountUSD: `${Number(f.amountUSD).toFixed(2)} USD`,
          description: f.description,
          name: f.name,
        }
      }),
    }
  }

  private getProvider(chainId: number): JsonRpcProvider {
    const urls: Record<number, string> = {
      [ChainId.ETH]: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      [ChainId.POL]: `https://polygon-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      [ChainId.BASE]: `https://base-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      [ChainId.ARB]: `https://arbitrum-mainnet.infura.io/v3/${INFURA_API_KEY}`,
    }
    const url = urls[chainId]
    if (!url) throw new Error(`No RPC provider for chainId: ${chainId}`)
    return new JsonRpcProvider(url)
  }

  private async approve(
    provider: JsonRpcProvider,
    chainId: number,
  ): Promise<void> {
    if (!this.pendingQuote) return
    const fromToken = this.pendingQuote.action.fromToken
    if (fromToken.address === EVM_ZERO_ADDRESS) return

    const spender = this.pendingQuote.estimate.approvalAddress
    const amount = BigInt(this.pendingQuote.action.fromAmount)

    const erc20 = new Contract(
      fromToken.address,
      new Interface([
        "function allowance(address owner, address spender) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)",
      ]),
      provider,
    )

    const allowance: bigint = await erc20.allowance(this.address!, spender)
    if (allowance >= amount) return

    const feeData = await provider.getFeeData()
    const nonce = await provider.getTransactionCount(this.address!)
    const approveData = erc20.interface.encodeFunctionData("approve", [
      spender,
      amount,
    ])

    const approvalRequest: EthSignTransactionRequest = {
      to: fromToken.address,
      value: BigInt(0),
      data: [approveData],
      nonce: BigInt(nonce),
      gas: BigInt(100_000),
      max_priority_fee_per_gas:
        feeData.maxPriorityFeePerGas ?? BigInt(2_000_000_000),
      max_fee_per_gas: feeData.maxFeePerGas ?? BigInt(10_000_000_000),
      chain_id: BigInt(chainId),
    }

    const signed = await chainFusionSignerService.ethSignTransaction(
      this.identity!,
      approvalRequest,
    )
    const response = await provider.broadcastTransaction(signed)
    await response.wait()
  }

  private async validateTransaction(): Promise<void> {
    if (!this.pendingQuote) throw new Error("No pending quote")

    const tx = this.pendingQuote.transactionRequest
    if (!tx?.to) throw new Error("Quote has no transactionRequest")

    const chainId = tx.chainId as number
    const provider = this.getProvider(chainId)

    const [balance, feeData] = await Promise.all([
      provider.getBalance(this.address!),
      provider.getFeeData(),
    ])

    const value = BigInt(tx.value ?? 0)
    const gasLimit = BigInt(tx.gasLimit ?? 500_000)
    const maxFeePerGas = feeData.maxFeePerGas ?? BigInt(10_000_000_000)
    const required = value + gasLimit * maxFeePerGas

    if (balance < required) {
      throw new Error(`Insufficient funds for transaction fees`)
    }
  }

  public async bridge(): Promise<string> {
    if (!this.pendingQuote)
      throw new Error("No pending quote. Call getQuote first.")

    try {
      const tx = this.pendingQuote.transactionRequest
      if (!tx?.to) throw new Error("Quote has no transactionRequest")

      const chainId = tx.chainId as number
      const provider = this.getProvider(chainId)

      await this.approve(provider, chainId)

      // Re-fetch quote after approval — the original may have expired during mining
      const freshQuote = await getQuote(this.client!, {
        fromAddress: this.address!,
        fromChain: this.pendingQuote.action.fromChainId,
        toChain: this.pendingQuote.action.toChainId,
        fromToken: this.pendingQuote.action.fromToken.address,
        toToken: this.pendingQuote.action.toToken.address,
        fromAmount: this.pendingQuote.action.fromAmount,
      })
      const freshTx = freshQuote.transactionRequest ?? tx

      const [feeData, nonce] = await Promise.all([
        provider.getFeeData(),
        provider.getTransactionCount(this.address!),
      ])

      const request: EthSignTransactionRequest = {
        to: freshTx.to as string,
        value: BigInt(freshTx.value ?? 0),
        data: freshTx.data ? [freshTx.data as string] : [],
        nonce: BigInt(nonce),
        gas: BigInt(freshTx.gasLimit ?? 500_000),
        max_priority_fee_per_gas:
          feeData.maxPriorityFeePerGas ?? BigInt(2_000_000_000),
        max_fee_per_gas: feeData.maxFeePerGas ?? BigInt(10_000_000_000),
        chain_id: BigInt(chainId),
      }

      const signed = await chainFusionSignerService.ethSignTransaction(
        this.identity!,
        request,
      )

      const response = await provider.broadcastTransaction(signed)
      const receipt = await response.wait()
      if (!receipt) throw new Error("No receipt for transaction")

      this.pendingQuote = null
      return response.hash
    } catch (e) {
      throw e
    }
  }

  public async getSupportedSourceTokens(
    tokens: FT[] | undefined,
  ): Promise<FT[] | undefined> {
    if (!tokens) return

    const evmTokens = tokens.filter(
      (t) => isEvmToken(t.getChainId()) && !isTestnetToken(t.getChainId()),
    )
    if (evmTokens.length === 0) return []

    const chainIds = [
      ...new Set(evmTokens.map((t) => t.getChainId() as number)),
    ]

    if (!this.supportedTokensCache) {
      const { tokens: tokensByChain } = await getTokens(this.client!, {
        chains: chainIds,
      })
      this.supportedTokensCache = new Set(
        Object.entries(tokensByChain).flatMap(([chainId, chainTokens]) =>
          chainTokens.map((t) => `${chainId}:${t.address.toLowerCase()}`),
        ),
      )
    }

    const supported = this.supportedTokensCache

    return evmTokens.filter((t) => {
      const address = t.getTokenAddress()
      if (address === ETH_NATIVE_ID || address === EVM_NATIVE) return true
      return supported.has(`${t.getChainId()}:${address.toLowerCase()}`)
    })
  }

  public getSupportedTargetTokens(
    tokens: FT[] | undefined,
    fromToken: FT | undefined,
  ): FT[] {
    if (!tokens || !fromToken) return []
    if (isTestnetToken(fromToken.getChainId())) return []

    return tokens.filter(
      (t) =>
        isEvmToken(t.getChainId()) &&
        !isTestnetToken(t.getChainId()) &&
        !(
          t.getChainId() === fromToken.getChainId() &&
          t.getTokenAddress() === fromToken.getTokenAddress()
        ),
    )
  }
}

export const bridgeService = new BridgeService()
