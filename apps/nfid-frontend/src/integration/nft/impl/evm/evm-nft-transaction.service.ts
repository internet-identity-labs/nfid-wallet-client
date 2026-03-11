import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

import {
  TransactionRecordAbstract,
  TransactionRecordView,
} from "src/integration/nft/impl/nft-transaction-record"
import { NFTTransactions } from "src/integration/nft/impl/nft-types"

// ─── Blockscout API types ─────────────────────────────────────────────────────

interface BlockscoutAddress {
  hash: string
}

interface BlockscoutTransfer {
  timestamp: string
  from: BlockscoutAddress | null
  to: BlockscoutAddress | null
  transaction_hash: string
  method: string | null
}

interface BlockscoutTransfersResponse {
  items: BlockscoutTransfer[]
  next_page_params: Record<string, unknown> | null
}

// ─── TransactionRecord implementation ────────────────────────────────────────

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

function resolveType(transfer: BlockscoutTransfer): string {
  const method = (transfer.method ?? "").toLowerCase()
  const toHash = transfer.to?.hash?.toLowerCase()
  const fromHash = transfer.from?.hash?.toLowerCase()

  if (!fromHash || fromHash === ZERO_ADDRESS || method.includes("mint")) {
    return "Mint"
  }
  if (!toHash || toHash === ZERO_ADDRESS || method.includes("burn")) {
    return "Burn"
  }
  if (method.includes("sale") || method.includes("buy")) {
    return "Sale"
  }
  return "Transfer"
}

export class EvmNftTransactionRecord extends TransactionRecordAbstract {
  private readonly view: TransactionRecordView

  constructor(transfer: BlockscoutTransfer) {
    super()
    this.view = new TransactionRecordView(
      resolveType(transfer),
      transfer.from?.hash,
      transfer.to?.hash,
      undefined,
      new Date(transfer.timestamp),
    )
  }

  getTransactionView(): TransactionRecordView {
    return this.view
  }
}

// ─── Blockscout URLs ──────────────────────────────────────────────────────────

const BLOCKSCOUT_URLS: Partial<Record<number, string>> = {
  [ChainId.ETH]: "https://eth.blockscout.com",
  [ChainId.BASE]: "https://base.blockscout.com",
  [ChainId.POL]: "https://polygon.blockscout.com",
  [ChainId.ARB]: "https://arbitrum.blockscout.com",
  [ChainId.BNB]: "https://bsc.blockscout.com",
  [ChainId.ETH_SEPOLIA]: "https://eth-sepolia.blockscout.com",
  [ChainId.BASE_SEPOLIA]: "https://base-sepolia.blockscout.com",
  [ChainId.ARB_SEPOLIA]: "https://arbitrum-sepolia.blockscout.com",
  [ChainId.POL_AMOY]: "https://polygon-amoy.blockscout.com",
  [ChainId.BNB_TESTNET]: "https://bsc-testnet.blockscout.com",
}

function blockscoutBaseUrl(chainId: number): string {
  return BLOCKSCOUT_URLS[chainId] ?? "https://eth.blockscout.com"
}

// ─── Service ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20

class EvmNftTransactionService {
  /**
   * Fetch transfer history for a single NFT instance from Blockscout.
   *
   * `from` is the 0-based page index. The service caches cursor tokens
   * internally so that sequential page loads are efficient.
   *
   * Blockscout uses cursor-based pagination, so random-access by page number
   * is not supported — callers must load pages in order starting from 0.
   */
  async getTransactions(
    chainId: number,
    contract: string,
    tokenId: string,
    page: number,
  ): Promise<NFTTransactions> {
    const base = blockscoutBaseUrl(chainId)
    const cursor = this.getCursor(chainId, contract, tokenId, page)

    const url = this.buildUrl(base, contract, tokenId, cursor)

    let data: BlockscoutTransfersResponse
    try {
      const resp = await fetch(url, { headers: { Accept: "application/json" } })
      if (!resp.ok) {
        console.error(`Blockscout NFT transfers error: ${resp.status}`)
        return { activity: [], isLastPage: true }
      }
      data = await resp.json()
    } catch (e) {
      console.error("Blockscout NFT transfers fetch failed:", e)
      return { activity: [], isLastPage: true }
    }

    const isLastPage = data.next_page_params === null

    if (!isLastPage) {
      this.saveCursor(
        chainId,
        contract,
        tokenId,
        page + 1,
        data.next_page_params!,
      )
    }

    return {
      activity: data.items.map((t) => new EvmNftTransactionRecord(t)),
      isLastPage,
    }
  }

  // ─── Cursor cache ───────────────────────────────────────────────────────────

  private readonly cursors = new Map<string, Record<string, unknown>>()

  private cursorKey(
    chainId: number,
    contract: string,
    tokenId: string,
    page: number,
  ): string {
    return `${chainId}:${contract.toLowerCase()}:${tokenId}:${page}`
  }

  private getCursor(
    chainId: number,
    contract: string,
    tokenId: string,
    page: number,
  ): Record<string, unknown> | undefined {
    if (page === 0) return undefined
    return this.cursors.get(this.cursorKey(chainId, contract, tokenId, page))
  }

  private saveCursor(
    chainId: number,
    contract: string,
    tokenId: string,
    nextPage: number,
    params: Record<string, unknown>,
  ): void {
    this.cursors.set(
      this.cursorKey(chainId, contract, tokenId, nextPage),
      params,
    )
  }

  private buildUrl(
    base: string,
    contract: string,
    tokenId: string,
    cursor?: Record<string, unknown>,
  ): string {
    const params = new URLSearchParams({ limit: String(PAGE_SIZE) })

    if (cursor) {
      Object.entries(cursor).forEach(([k, v]) =>
        params.set(`next_page_params[${k}]`, String(v)),
      )
    }

    return `${base}/api/v2/tokens/${contract}/instances/${tokenId}/transfers?${params}`
  }
}

export const evmNftTransactionService = new EvmNftTransactionService()
