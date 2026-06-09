import { SignIdentity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { isAddress, formatUnits, parseUnits } from "ethers"
import validate from "bitcoin-address-validation"

import { ethereumService } from "../ethereum/eth/ethereum.service"
import { polygonService } from "../ethereum/polygon/polygon.service"
import { arbitrumService } from "../ethereum/arbitrum/arbitrum.service"
import { baseService } from "../ethereum/base/base.service"
import { EVMService, SendEthFee } from "../ethereum/evm.service"
import { bitcoinService } from "../bitcoin/bitcoin.service"
import { Address } from "../bitcoin/services/chain-fusion-signer.service"

import { decodeLnurl } from "./lnurl-decoder"
import {
  OCPInvalidResponseError,
  OCPNetworkError,
  OCPQuoteExpiredError,
  OCPCurrencyNotSupportedError,
  OCPInsufficientBalanceError,
  OCPTransactionSignError,
  OCPSubmitError,
} from "./errors"
import {
  OCPNetwork,
  OCPPayRequest,
  OCPCurrency,
  OCPQuote,
  OCPCallbackResponse,
  OCPSubmitResponse,
  OCPPaymentSummary,
} from "./types"

const SUPPORTED_NETWORKS: OCPNetwork[] = [
  "Ethereum",
  "Polygon",
  "Arbitrum",
  "Base",
  "Bitcoin",
  "ICP",
]

const REQUEST_TIMEOUT_MS = 10_000
const ICP_FEE_E8S = BigInt(10_000)

export class OpenCryptoPayService {
  decodeLnurl(lnurl: string): string {
    return decodeLnurl(lnurl)
  }

  async getPaymentDetails(paymentUrl: string): Promise<OCPPayRequest> {
    const response = await this.fetchWithTimeout(paymentUrl)
    const data = await response.json()

    if (data?.tag !== "payRequest" || !Array.isArray(data.currencies)) {
      throw new OCPInvalidResponseError(paymentUrl, data)
    }

    return data as OCPPayRequest
  }

  async getAvailableCurrencies(
    currencies: OCPCurrency[],
    identity: SignIdentity,
  ): Promise<OCPCurrency[]> {
    const supported = currencies.filter((c) =>
      this.isNetworkSupported(c.network),
    )

    const results = await Promise.allSettled(
      supported.map(async (currency) => {
        const balance = await this.getBalanceForNetwork(
          currency.network,
          identity,
        )
        const balanceInUnits = Number(formatUnits(balance, currency.decimals))
        return balanceInUnits >= currency.minSendable ? currency : null
      }),
    )

    return results
      .filter(
        (r): r is PromiseFulfilledResult<OCPCurrency> =>
          r.status === "fulfilled" && r.value !== null,
      )
      .map((r) => r.value)
  }

  async getQuote(
    callbackUrl: string,
    amount: number,
    currency: string,
  ): Promise<OCPQuote> {
    const url = new URL(callbackUrl)
    url.searchParams.set("amount", amount.toString())
    url.searchParams.set("currency", currency)

    const response = await this.fetchWithTimeout(url.toString())
    const data: OCPCallbackResponse = await response.json()

    if (!data?.quote?.id || !data.quote.targetAddress) {
      throw new OCPInvalidResponseError(url.toString(), data)
    }

    return data.quote
  }

  isQuoteExpired(quote: OCPQuote): boolean {
    return new Date(quote.expiresAt).getTime() <= Date.now()
  }

  async getPaymentSummary(
    payRequest: OCPPayRequest,
    currency: OCPCurrency,
    quote: OCPQuote,
    identity: SignIdentity,
  ): Promise<OCPPaymentSummary> {
    if (this.isQuoteExpired(quote)) {
      throw new OCPQuoteExpiredError(quote.id, quote.expiresAt)
    }

    const recipientName = this.parseRecipientName(payRequest.metadata)
    const networkFee = await this.estimateNetworkFee(
      currency.network,
      quote,
      identity,
    )

    const amount = Number(quote.amount)
    const fee = Number(quote.fee)
    const netFee = Number(networkFee)
    const totalAmount = (amount + fee + netFee).toString()

    let totalAmountUSD = "0"
    if (currency.convertedMultiplier) {
      totalAmountUSD = (
        Number(totalAmount) * currency.convertedMultiplier
      ).toFixed(2)
    }

    const quoteExpiresIn = Math.max(
      0,
      Math.floor((new Date(quote.expiresAt).getTime() - Date.now()) / 1000),
    )

    return {
      recipientName,
      currency,
      quote,
      networkFee,
      totalAmount,
      totalAmountUSD,
      quoteExpiresIn,
    }
  }

  async executePayment(
    quote: OCPQuote,
    identity: SignIdentity,
  ): Promise<OCPSubmitResponse> {
    if (this.isQuoteExpired(quote)) {
      throw new OCPQuoteExpiredError(quote.id, quote.expiresAt)
    }

    if (!this.validateTargetAddress(quote.targetAddress, quote.method)) {
      throw new OCPCurrencyNotSupportedError(quote.asset, quote.method)
    }

    const balance = await this.getBalanceForNetwork(quote.method, identity)
    const requiredAmount = this.getRequiredAmount(quote)
    if (balance < requiredAmount) {
      throw new OCPInsufficientBalanceError(
        requiredAmount.toString(),
        balance.toString(),
        quote.asset,
      )
    }

    let txId: string
    let rawTx: string

    try {
      const result = await this.signAndSend(quote, identity)
      txId = result.txId
      rawTx = result.rawTx
    } catch (e) {
      if (e instanceof OCPInsufficientBalanceError) throw e
      throw new OCPTransactionSignError(
        quote.method,
        e instanceof Error ? e : new Error(String(e)),
      )
    }

    return this.submitToOCP(quote, txId, rawTx)
  }

  validateTargetAddress(address: string, network: OCPNetwork): boolean {
    switch (network) {
      case "Ethereum":
      case "Polygon":
      case "Arbitrum":
      case "Base":
        return isAddress(address)
      case "Bitcoin":
        return validate(address)
      case "ICP":
        return this.isValidIcpAddress(address)
      default:
        return false
    }
  }

  // ── Private helpers ──

  private getRequiredAmount(quote: OCPQuote): bigint {
    switch (quote.method) {
      case "Ethereum":
      case "Polygon":
      case "Arbitrum":
      case "Base":
        return parseUnits(quote.amount, 18) + parseUnits(quote.fee, 18)
      case "Bitcoin":
        return parseUnits(quote.amount, 8) + parseUnits(quote.fee, 8)
      case "ICP":
        return (
          parseUnits(quote.amount, 8) + parseUnits(quote.fee, 8) + ICP_FEE_E8S
        )
      default:
        return BigInt(0)
    }
  }

  private isNetworkSupported(network: string): network is OCPNetwork {
    return SUPPORTED_NETWORKS.includes(network as OCPNetwork)
  }

  private getEvmService(network: OCPNetwork): EVMService {
    switch (network) {
      case "Ethereum":
        return ethereumService
      case "Polygon":
        return polygonService
      case "Arbitrum":
        return arbitrumService
      case "Base":
        return baseService
      default:
        throw new OCPCurrencyNotSupportedError("native", network)
    }
  }

  private async getBalanceForNetwork(
    network: OCPNetwork,
    identity: SignIdentity,
  ): Promise<bigint> {
    switch (network) {
      case "Ethereum":
      case "Polygon":
      case "Arbitrum":
      case "Base": {
        const service = this.getEvmService(network)
        const address = await service.getAddress(identity)
        return service.getBalance(address)
      }
      case "Bitcoin": {
        return bitcoinService.getBalance(identity)
      }
      case "ICP": {
        const { ICP_CANISTER_ID } =
          await import("@nfid/integration/token/constants")
        const { createAgent } = await import("@nfid-frontend/utils")
        const { IcrcLedgerCanister } =
          await import("@icp-sdk/canisters/ledger/icrc")
        const agent = await createAgent({
          identity,
          host: "https://ic0.app",
        })
        const ledger = IcrcLedgerCanister.create({
          agent,
          canisterId: Principal.fromText(ICP_CANISTER_ID),
        })
        return ledger.balance({
          owner: identity.getPrincipal(),
          certified: false,
        })
      }
      default:
        throw new OCPCurrencyNotSupportedError("native", network)
    }
  }

  private async estimateNetworkFee(
    network: OCPNetwork,
    quote: OCPQuote,
    identity: SignIdentity,
  ): Promise<string> {
    switch (network) {
      case "Ethereum":
      case "Polygon":
      case "Arbitrum":
      case "Base": {
        const service = this.getEvmService(network)
        const from = await service.getAddress(identity)
        const fee: SendEthFee = await service.getSendEthFee(
          quote.targetAddress as Address,
          from as Address,
          quote.amount,
        )
        return formatUnits(fee.ethereumNetworkFee, 18)
      }
      case "Bitcoin": {
        try {
          const feeData = await bitcoinService.getFee(identity, quote.amount)
          return formatUnits(feeData.fee_satoshis, 8)
        } catch {
          return "0.00001"
        }
      }
      case "ICP": {
        return formatUnits(ICP_FEE_E8S, 8)
      }
      default:
        return "0"
    }
  }

  private async signAndSend(
    quote: OCPQuote,
    identity: SignIdentity,
  ): Promise<{ txId: string; rawTx: string }> {
    switch (quote.method) {
      case "Ethereum":
      case "Polygon":
      case "Arbitrum":
      case "Base":
        return this.signAndSendEvm(quote, identity)
      case "Bitcoin":
        return this.signAndSendBtc(quote, identity)
      case "ICP":
        return this.signAndSendIcp(quote, identity)
      default:
        throw new OCPCurrencyNotSupportedError(quote.asset, quote.method)
    }
  }

  private async signAndSendEvm(
    quote: OCPQuote,
    identity: SignIdentity,
  ): Promise<{ txId: string; rawTx: string }> {
    const service = this.getEvmService(quote.method)
    const from = await service.getAddress(identity)
    const fee = await service.getSendEthFee(
      quote.targetAddress as Address,
      from as Address,
      quote.amount,
    )

    const { ChainId } = await import("@nfid/integration/token/icrc1/enum/enums")

    const chainIdMap: Record<string, number> = {
      Ethereum: ChainId.ETH,
      Polygon: ChainId.POL,
      Arbitrum: ChainId.ARB,
      Base: ChainId.BASE,
    }

    const response = await service.sendEthTransaction(
      identity,
      quote.targetAddress as Address,
      quote.amount,
      fee,
      chainIdMap[quote.method],
    )

    return {
      txId: response.hash,
      rawTx: response.hash,
    }
  }

  private async signAndSendBtc(
    quote: OCPQuote,
    identity: SignIdentity,
  ): Promise<{ txId: string; rawTx: string }> {
    const fee = await bitcoinService.getFee(identity, quote.amount)

    const txId = await bitcoinService.send(
      identity,
      quote.targetAddress,
      quote.amount,
      fee,
    )

    return { txId, rawTx: txId }
  }

  private async signAndSendIcp(
    quote: OCPQuote,
    identity: SignIdentity,
  ): Promise<{ txId: string; rawTx: string }> {
    const { transferICRC1 } = await import("@nfid/integration/token/icrc1")
    const { ICP_CANISTER_ID } =
      await import("@nfid/integration/token/constants")

    const amountE8s = parseUnits(quote.amount, 8)

    let owner: Principal
    try {
      owner = Principal.fromText(quote.targetAddress)
    } catch {
      throw new OCPCurrencyNotSupportedError(quote.asset, "ICP")
    }

    const result = await transferICRC1(identity, ICP_CANISTER_ID, {
      to: { owner, subaccount: [] },
      amount: amountE8s,
      fee: [ICP_FEE_E8S],
      memo: [],
      from_subaccount: [],
      created_at_time: [],
    })

    if ("Err" in result) {
      throw new Error(`ICRC1 transfer failed: ${JSON.stringify(result.Err)}`)
    }

    const blockIndex = result.Ok.toString()
    return { txId: blockIndex, rawTx: blockIndex }
  }

  private async submitToOCP(
    quote: OCPQuote,
    txId: string,
    _rawTx: string,
    submitBaseUrl?: string,
  ): Promise<OCPSubmitResponse> {
    const base =
      submitBaseUrl ?? `https://api.opencryptopay.io/v1/lnurlp/tx/${txId}`
    const url = new URL(base)
    url.searchParams.set("method", quote.method)
    url.searchParams.set("quote", quote.id)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const response = await fetch(url.toString(), {
        signal: controller.signal,
      })

      if (response.ok) {
        return { status: "ok" }
      }

      const body = await response.text()
      throw new OCPSubmitError(quote.id, body)
    } catch (e) {
      if (e instanceof OCPSubmitError) throw e
      throw new OCPNetworkError(url.toString())
    } finally {
      clearTimeout(timeout)
    }
  }

  private parseRecipientName(metadata: string): string {
    try {
      const parsed = JSON.parse(metadata)
      if (Array.isArray(parsed)) {
        const textEntry = parsed.find(
          (entry: [string, string]) => entry[0] === "text/plain",
        )
        return textEntry?.[1] ?? "Unknown"
      }
      return "Unknown"
    } catch {
      return "Unknown"
    }
  }

  private isValidIcpAddress(address: string): boolean {
    try {
      Principal.fromText(address)
      return true
    } catch {
      return address.length === 64 && /^[0-9a-fA-F]+$/.test(address)
    }
  }

  private async fetchWithTimeout(
    url: string,
    init?: RequestInit,
  ): Promise<Response> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new OCPNetworkError(url, response.status)
      }

      return response
    } catch (e) {
      if (e instanceof OCPNetworkError) throw e
      throw new OCPNetworkError(url)
    } finally {
      clearTimeout(timeout)
    }
  }
}

export const openCryptoPayService = new OpenCryptoPayService()
