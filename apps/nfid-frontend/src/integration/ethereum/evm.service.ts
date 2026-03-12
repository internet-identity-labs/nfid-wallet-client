import { HttpAgent, SignIdentity } from "@dfinity/agent"
import {
  CkETHMinterCanister,
  encodePrincipalToEthAddress,
} from "@dfinity/cketh"
import { Account } from "@dfinity/ledger-icp"
import { ApproveParams, IcrcLedgerCanister } from "@dfinity/ledger-icrc"
import { TransferArg } from "@dfinity/ledger-icrc/dist/candid/icrc_ledger"
import { Principal } from "@dfinity/principal"
import {
  Contract,
  Interface,
  InfuraProvider,
  parseEther,
  TransactionRequest,
  type FeeData,
  type TransactionResponse,
} from "ethers"
import { ttlCacheService } from "@nfid/client-db"
import { agentBaseConfig } from "packages/integration/src/lib/actors"

import { transferICRC1 } from "@nfid/integration/token/icrc1"

import { EthSignTransactionRequest } from "../bitcoin/idl/chain-fusion-signer.d"
import {
  Address,
  Balance,
  chainFusionSignerService,
} from "../bitcoin/services/chain-fusion-signer.service"
import { patronService } from "../bitcoin/services/patron.service"
import { CKETH_ABI } from "./cketh.constants"
import { getWalletDelegation } from "../facade/wallet"
import {
  MINTER_ADDRESS,
  CKETH_MINTER_CANISTER_ID,
  CKETH_NETWORK_FEE,
  INFURA_API_KEY,
  CHAIN_ID,
  CKETH_LEDGER_CANISTER_ID,
} from "@nfid/integration/token/constants"
import { KEY_ETH_ADDRESS } from "packages/integration/src/lib/authentication/storage"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

export type SendEthFee = {
  gasUsed: bigint
  maxPriorityFeePerGas: bigint
  maxFeePerGas: bigint
  baseFeePerGas: bigint
  ethereumNetworkFee: bigint
}

export type CkEthToEthFee = {
  ethereumNetworkFee: bigint
  amountToReceive: bigint
  icpNetworkFee: bigint
  identityLabsFee: bigint
}

export type EthToCkEthFee = {
  gasUsed: bigint
  maxPriorityFeePerGas: bigint
  maxFeePerGas: bigint
  baseFeePerGas: bigint
  ethereumNetworkFee: bigint
  amountToReceive: bigint
  icpNetworkFee: bigint
}

export interface EvmNftMetadata {
  name?: string
  description?: string
  image?: string
  image_url?: string
  external_url?: string
  attributes?: Array<{ trait_type: string; value: string }>
}

export interface EvmNftAsset {
  contract: string
  tokenId: string
  supply: string
  type: "ERC-721" | "ERC-1155" | "ERC-404"
  metadata?: EvmNftMetadata
  imageUrl?: string
  animationUrl?: string
  tokenName?: string
  tokenSymbol?: string
  chainId: number
  acquiredAt?: number
}

interface BlockscoutNftItem {
  id: string
  token_type: "ERC-721" | "ERC-1155" | "ERC-404"
  value: string
  image_url?: string
  animation_url?: string
  metadata?: Record<string, unknown>
  token: {
    address_hash: string
    name?: string
    symbol?: string
  }
}

interface BlockscoutNftResponse {
  items: BlockscoutNftItem[]
  next_page_params: Record<string, string> | null
}

interface BlockscoutTransferItem {
  timestamp: string
  token: { address_hash: string }
  total: { token_id?: string } | null
}

interface BlockscoutTransfersResponse {
  items: BlockscoutTransferItem[]
  next_page_params: Record<string, string> | null
}

const EVM_NFTS_CACHE_TTL = 30 * 1000
export const EVM_NFTS_CACHE_NAME = "EVM_NFTS_"
export const EVM_BALANCE_CACHE_NAME = "EVM_BALANCE_"

/**
 * Build a Blockscout API URL, routing through the dev-server proxy in
 * development to avoid the browser CORS restriction.
 *
 * Dev  (craco proxy):  /blockscout/bsc/api/v2/addresses/0x.../nft?type=...
 * Prod (direct):       https://bsc.blockscout.com/api/v2/addresses/0x.../nft?type=...
 *
 * `new URL()` cannot parse relative paths without a base, so we use
 * `URLSearchParams` for query-string building and plain string concatenation
 * for the path.
 */
function buildBlockscoutUrl(
  blockscoutBaseUrl: string,
  apiPath: string,
  params: Record<string, string> = {},
): string {
  const base =
    process.env.NODE_ENV === "development"
      ? `/blockscout/${new URL(blockscoutBaseUrl).hostname.split(".")[0]}`
      : blockscoutBaseUrl

  const qs = new URLSearchParams(params).toString()
  return `${base}${apiPath}${qs ? `?${qs}` : ""}`
}

const ERC721_TRANSFER_IFACE = new Interface([
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
])
const ERC1155_TRANSFER_IFACE = new Interface([
  "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)",
])

export abstract class EVMService {
  protected provider: InfuraProvider
  protected readonly blockscoutBaseUrl: string | undefined = undefined

  constructor() {
    this.provider = new InfuraProvider(CHAIN_ID, INFURA_API_KEY)
  }

  public async getQuickAddress() {
    const { cachedValue } = this.getAddressFromCache()

    if (cachedValue == null) {
      const identity = await getWalletDelegation()
      return this.getAddress(identity)
    } else {
      return cachedValue as string
    }
  }

  //get eth address from global identity
  public async getAddress(identity: SignIdentity): Promise<Address> {
    const { cachedValue, key } = this.getAddressFromCache()

    if (cachedValue != null) {
      return cachedValue as string
    }
    await patronService.askToPayFor(identity)

    const address = await chainFusionSignerService.getEthAddress(identity)
    localStorage.setItem(key, address)
    return address
  }

  //get balance of eth address
  public async getBalance(address: Address): Promise<Balance> {
    const network = await this.provider.getNetwork()
    const chainId = Number(network.chainId)
    const cacheKey = `${EVM_BALANCE_CACHE_NAME}${chainId}_${address.toLowerCase()}`

    return ttlCacheService.getOrFetch(
      cacheKey,
      () => this.provider.getBalance(address),
      () => 20000 + Math.floor(Math.random() * 10000),
      {
        serialize: (v) => v.toString(),
        deserialize: (v) => BigInt(v as string) as Balance,
        onBackgroundError: (error) =>
          console.error("Failed to refresh balance cache:", error),
      },
    )
  }

  public async getNFTs(address: string): Promise<EvmNftAsset[]> {
    if (!this.blockscoutBaseUrl) return []

    const network = await this.provider.getNetwork()
    const chainId = Number(network.chainId)
    const cacheKey = `${EVM_NFTS_CACHE_NAME}${chainId}_${address.toLowerCase()}`

    return ttlCacheService.getOrFetch(
      cacheKey,
      () => this.fetchNFTs(address, chainId),
      EVM_NFTS_CACHE_TTL,
      {
        onBackgroundError: (error) =>
          console.error("Failed to refresh EVM NFTs cache:", error),
      },
    )
  }

  private async fetchNFTs(
    address: string,
    chainId: number,
  ): Promise<EvmNftAsset[]> {
    if (!this.blockscoutBaseUrl) return []
    const nfts = await this.fetchNFTList(
      address,
      this.blockscoutBaseUrl,
      chainId,
    )
    if (nfts.length === 0) return nfts

    const ownedKeys = new Set(
      nfts.map((n) => `${n.contract.toLowerCase()}:${n.tokenId}`),
    )
    const timestamps = await this.fetchNFTTimestamps(
      address,
      this.blockscoutBaseUrl,
      ownedKeys,
    ).catch(() => new Map<string, number>())

    return nfts.map((nft) => ({
      ...nft,
      acquiredAt: timestamps.get(
        `${nft.contract.toLowerCase()}:${nft.tokenId}`,
      ),
    }))
  }

  private async fetchNFTList(
    address: string,
    baseUrl: string,
    chainId: number,
  ): Promise<EvmNftAsset[]> {
    const results: EvmNftAsset[] = []
    let nextPageParams: Record<string, string> | null = null

    do {
      const url = buildBlockscoutUrl(
        baseUrl,
        `/api/v2/addresses/${address}/nft`,
        { type: "ERC-721,ERC-1155,ERC-404", ...(nextPageParams ?? {}) },
      )

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(
          `Blockscout API error: ${response.status} ${response.statusText}`,
        )
      }

      const data: BlockscoutNftResponse = await response.json()

      for (const item of data.items) {
        results.push({
          contract: item.token.address_hash,
          tokenId: item.id,
          supply: item.value,
          type: item.token_type,
          metadata: item.metadata as EvmNftMetadata | undefined,
          imageUrl: item.image_url,
          animationUrl: item.animation_url,
          tokenName: item.token.name,
          tokenSymbol: item.token.symbol,
          chainId,
        })
      }

      nextPageParams = data.next_page_params ?? null
    } while (nextPageParams)

    return results
  }

  private async fetchNFTTimestamps(
    address: string,
    baseUrl: string,
    ownedKeys: Set<string>,
  ): Promise<Map<string, number>> {
    const timestamps = new Map<string, number>()
    const remaining = new Set(ownedKeys)
    let nextPageParams: Record<string, string> | null = null

    do {
      const url = buildBlockscoutUrl(
        baseUrl,
        `/api/v2/addresses/${address}/token-transfers`,
        {
          type: "ERC-721,ERC-1155,ERC-404",
          filter: "to",
          ...(nextPageParams ?? {}),
        },
      )

      const response = await fetch(url)
      if (!response.ok) break

      const data: BlockscoutTransfersResponse = await response.json()

      for (const item of data.items) {
        const tokenId = item.total?.token_id
        if (!tokenId) continue
        const key = `${item.token.address_hash.toLowerCase()}:${tokenId}`
        if (remaining.has(key) && !timestamps.has(key)) {
          timestamps.set(key, new Date(item.timestamp).getTime())
          remaining.delete(key)
        }
      }

      nextPageParams = data.next_page_params ?? null
    } while (nextPageParams && remaining.size > 0)

    return timestamps
  }

  public async getQuickBalance(): Promise<Balance> {
    const { cachedValue } = this.getAddressFromCache()

    if (!cachedValue) {
      throw Error("No ethereum address in a cache.")
    }

    return await this.getBalance(cachedValue as Address)
  }

  //retrieve fee data from provider
  private async getFeeData(): Promise<FeeData> {
    const feeData = await this.provider.getFeeData()
    return feeData
  }

  //estimate gas for transaction
  private async estimateGas({
    to,
    from,
    value,
    data,
  }: TransactionRequest): Promise<bigint> {
    return await this.provider.estimateGas({
      to,
      value,
      from,
      data,
    })
  }

  //deposit eth to ckETH
  public async convertToCkEth(
    identity: SignIdentity,
    amount: string,
    gas: {
      gasUsed: bigint
      maxPriorityFeePerGas: bigint
      maxFeePerGas: bigint
      baseFeePerGas: bigint
    },
  ) {
    const ckEthContract = new Contract(MINTER_ADDRESS, CKETH_ABI, this.provider)

    const address = await this.getAddress(identity)

    const principalHex = encodePrincipalToEthAddress(identity.getPrincipal())

    const subaccount =
      "0x0000000000000000000000000000000000000000000000000000000000000000"

    const trs = await ckEthContract.depositEth.populateTransaction(
      principalHex,
      subaccount,
      { value: parseEther(amount) },
    )
    const nonce = await this.getTransactionCount(address)

    const network = await this.provider.getNetwork()
    const chainId = Number(network.chainId)

    const trs_request: EthSignTransactionRequest = {
      to: trs.to,
      value: parseEther(amount),
      data: [trs.data],
      nonce: BigInt(nonce),
      gas: gas.gasUsed,
      max_priority_fee_per_gas: gas.maxPriorityFeePerGas,
      max_fee_per_gas: gas.maxFeePerGas,
      chain_id: BigInt(chainId),
    }
    const signedTransaction = await chainFusionSignerService.ethSignTransaction(
      identity,
      trs_request,
    )
    const response = await this.sendTransaction(signedTransaction)
    return response
  }

  private getIdentityLabsFee(parsedAmount: bigint): bigint {
    return (parsedAmount * BigInt(875)) / BigInt(10000000000)
  }

  //convert ckETH to eth
  public async convertFromCkEth(
    address: Address,
    amount: string,
    identity: SignIdentity,
  ) {
    const parsedAmount = parseEther(amount)
    //we take 0.0000875% ckETH as fee
    const identityLabsFee: bigint = this.getIdentityLabsFee(parsedAmount)

    //Minimum amount 0.03 ckETH
    if (parsedAmount < BigInt(30000000000000000)) {
      throw new Error("The minimum amount for conversion is 0.03 ckETH")
    }

    await this.approveTransfer(
      CKETH_LEDGER_CANISTER_ID,
      CKETH_MINTER_CANISTER_ID,
      parsedAmount,
      identity,
    )

    const agent = new HttpAgent({
      ...agentBaseConfig,
      identity: identity,
    })

    const ckEthMinter = CkETHMinterCanister.create({
      agent,
      canisterId: Principal.fromText(CKETH_MINTER_CANISTER_ID),
    })

    const result = await ckEthMinter.withdrawEth({
      address,
      amount: parsedAmount,
    })

    const transferArgs: TransferArg = {
      amount: identityLabsFee,
      created_at_time: [],
      fee: [],
      from_subaccount: [],
      memo: [],
      to: {
        subaccount: [],
        owner: Principal.fromText(NFID_WALLET_CANISTER),
      },
    }

    transferICRC1(identity, CKETH_LEDGER_CANISTER_ID, transferArgs)

    return result
  }

  public async getSendEthFee(
    to: Address,
    from: Address,
    value: string,
  ): Promise<SendEthFee> {
    const gasUsed = await this.estimateGas({
      to,
      from,
      value: parseEther(value),
    })

    const feeData = await this.getFeeData()
    if (
      feeData.maxFeePerGas === null ||
      feeData.maxPriorityFeePerGas === null
    ) {
      throw new Error("getApproximateEthFee: Gas fee data is missing")
    }

    const baseFee = await this.getBaseFee()

    const ethereumNetworkFee = this.estimateTransaction(
      gasUsed,
      feeData.maxFeePerGas,
    )

    return {
      gasUsed,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      maxFeePerGas: feeData.maxFeePerGas,
      baseFeePerGas: baseFee,
      ethereumNetworkFee,
    }
  }

  public async getEthToCkEthFee(
    identity: SignIdentity,
    amount: string,
  ): Promise<EthToCkEthFee> {
    const ckEthContract = new Contract(MINTER_ADDRESS, CKETH_ABI, this.provider)
    const fromAddress = await this.getAddress(identity)
    const principalHex = encodePrincipalToEthAddress(identity.getPrincipal())

    const subaccount =
      "0x0000000000000000000000000000000000000000000000000000000000000000"

    const txRequest = await ckEthContract.depositEth.populateTransaction(
      principalHex,
      subaccount,
      { value: parseEther(amount.toString()) },
    )

    const gasEstimate = await this.estimateGas({
      to: txRequest.to,
      from: fromAddress,
      value: txRequest.value,
      data: txRequest.data,
    })

    const feeData = await this.getFeeData()
    if (!feeData.maxFeePerGas || !feeData.maxPriorityFeePerGas) {
      throw new Error("getApproximateEthFee: Gas fee data is missing")
    }

    const baseFee = await this.getBaseFee()
    const maxPriorityFeePerGas =
      feeData.maxPriorityFeePerGas || BigInt(2_000_000_000)

    const maxFeePerGas =
      feeData.maxFeePerGas || maxPriorityFeePerGas + BigInt(5_000_000_000)

    const ethereumNetworkFee = this.estimateTransaction(
      gasEstimate,
      maxFeePerGas,
    )

    return {
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      maxFeePerGas: feeData.maxFeePerGas,
      gasUsed: gasEstimate,
      baseFeePerGas: baseFee,
      ethereumNetworkFee,
      amountToReceive:
        parseEther(amount.toString()) - ethereumNetworkFee - CKETH_NETWORK_FEE,
      icpNetworkFee: CKETH_NETWORK_FEE,
    }
  }

  public async getCkEthToEthFee(
    to: string,
    amount: string,
  ): Promise<CkEthToEthFee> {
    const parsedAmount = parseEther(amount.toString())
    const identityLabsFee = this.getIdentityLabsFee(parsedAmount)
    const amountToReceive = parsedAmount - identityLabsFee - CKETH_NETWORK_FEE

    const gasEstimate = await this.estimateGas({
      to,
      value: parsedAmount,
    })

    const feeData = await this.provider.getFeeData()
    const maxPriorityFeePerGas =
      feeData.maxPriorityFeePerGas || BigInt(2_000_000_000)
    const maxFeePerGas =
      feeData.maxFeePerGas || maxPriorityFeePerGas + BigInt(5_000_000_000)

    const ethereumNetworkFee = this.estimateTransaction(
      gasEstimate,
      maxFeePerGas,
    )

    return {
      ethereumNetworkFee,
      amountToReceive,
      icpNetworkFee: CKETH_NETWORK_FEE * BigInt(2),
      identityLabsFee,
    }
  }

  private estimateTransaction(gas: bigint, maxFeePerGas: bigint): bigint {
    return gas * maxFeePerGas
  }

  //transfer eth
  public async sendEthTransaction(
    identity: SignIdentity,
    to: Address,
    value: string,
    gas: {
      gasUsed: bigint
      maxPriorityFeePerGas: bigint
      maxFeePerGas: bigint
      baseFeePerGas: bigint
    },
    chainId: ChainId,
  ): Promise<TransactionResponse> {
    const address = await this.getAddress(identity)

    const nonce = await this.getTransactionCount(address)

    const request: EthSignTransactionRequest = {
      chain_id: BigInt(chainId),
      to: to,
      value: parseEther(value),
      data: [],
      nonce: BigInt(nonce),
      gas: gas?.gasUsed,
      max_priority_fee_per_gas: gas?.maxPriorityFeePerGas,
      max_fee_per_gas: gas?.maxFeePerGas,
    }

    const signedTransaction = await chainFusionSignerService.ethSignTransaction(
      identity,
      request,
    )

    return await this.sendTransaction(signedTransaction)
  }

  public async getNFTTransferFee(
    from: Address,
    to: Address,
    asset: Pick<EvmNftAsset, "contract" | "tokenId" | "type">,
  ): Promise<SendEthFee> {
    const data = this.buildNFTTransferData(from, to, asset)

    const gasUsed = await this.estimateGas({
      from,
      to: asset.contract as Address,
      data,
    })

    const feeData = await this.getFeeData()
    if (!feeData.maxFeePerGas || !feeData.maxPriorityFeePerGas) {
      throw new Error("getNFTTransferFee: Gas fee data is missing")
    }

    const baseFee = await this.getBaseFee()

    return {
      gasUsed,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      maxFeePerGas: feeData.maxFeePerGas,
      baseFeePerGas: baseFee,
      ethereumNetworkFee: this.estimateTransaction(
        gasUsed,
        feeData.maxFeePerGas,
      ),
    }
  }

  public async sendNFTTransaction(
    identity: SignIdentity,
    to: Address,
    asset: Pick<EvmNftAsset, "contract" | "tokenId" | "type">,
    gas: {
      gasUsed: bigint
      maxPriorityFeePerGas: bigint
      maxFeePerGas: bigint
      baseFeePerGas: bigint
    },
  ): Promise<TransactionResponse> {
    const from = await this.getAddress(identity)
    const network = await this.provider.getNetwork()
    const chainId = Number(network.chainId)
    const nonce = await this.getTransactionCount(from)
    const data = this.buildNFTTransferData(from, to, asset)

    const request: EthSignTransactionRequest = {
      chain_id: BigInt(chainId),
      to: asset.contract,
      value: BigInt(0),
      data: [data],
      nonce: BigInt(nonce),
      gas: gas.gasUsed,
      max_priority_fee_per_gas: gas.maxPriorityFeePerGas,
      max_fee_per_gas: gas.maxFeePerGas,
    }

    const signedTransaction = await chainFusionSignerService.ethSignTransaction(
      identity,
      request,
    )
    return this.sendTransaction(signedTransaction)
  }

  private buildNFTTransferData(
    from: Address,
    to: Address,
    asset: Pick<EvmNftAsset, "tokenId" | "type">,
  ): string {
    const tokenId = BigInt(asset.tokenId)
    if (asset.type === "ERC-1155") {
      return ERC1155_TRANSFER_IFACE.encodeFunctionData("safeTransferFrom", [
        from,
        to,
        tokenId,
        BigInt(1),
        "0x",
      ])
    }
    return ERC721_TRANSFER_IFACE.encodeFunctionData("safeTransferFrom", [
      from,
      to,
      tokenId,
    ])
  }

  private getAddressFromCache() {
    const cachedValue = localStorage.getItem(KEY_ETH_ADDRESS)

    return {
      cachedValue,
      key: KEY_ETH_ADDRESS,
    }
  }

  private async approveTransfer(
    ledgerCanisterId: string,
    minterCanisterId: string,
    amount: bigint,
    identity: SignIdentity,
  ): Promise<bigint> {
    const ledger = IcrcLedgerCanister.create({
      canisterId: Principal.fromText(ledgerCanisterId),
      agent: new HttpAgent({
        ...agentBaseConfig,
        identity: identity,
      }),
    })
    const spender: Account = {
      owner: Principal.fromText(minterCanisterId),
      subaccount: [],
    }
    const params: ApproveParams = {
      spender,
      amount,
    }
    const icrc2approve = await ledger.approve(params)

    return BigInt(icrc2approve)
  }

  public async getTransactionCount(address: Address): Promise<number> {
    const transactionCount = await this.provider.getTransactionCount(address)
    return transactionCount
  }

  public async ethPersonalSign(
    identity: SignIdentity,
    message: string,
  ): Promise<string> {
    return await chainFusionSignerService.ethPersonalSign(identity, message)
  }

  private async getBaseFee() {
    const block = await this.provider.getBlock("latest")
    return block?.baseFeePerGas ?? BigInt(0)
  }

  private async sendTransaction(
    signedTransaction: string,
  ): Promise<TransactionResponse> {
    try {
      const response =
        await this.provider.broadcastTransaction(signedTransaction)
      await response.wait()
      return response
    } catch (e) {
      throw e
    }
  }
}
