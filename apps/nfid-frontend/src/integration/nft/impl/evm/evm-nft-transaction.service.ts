import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

import {
  TransactionRecordAbstract,
  TransactionRecordView,
} from "src/integration/nft/impl/nft-transaction-record"
import { NFTTransactions } from "src/integration/nft/impl/nft-types"
import { MORALIS_API_KEY } from "src/integration/nft/impl/evm/evm-nft-floor-price.service"

// ─── Moralis API types ────────────────────────────────────────────────────────

interface MoralisNftTransfer {
  block_timestamp: string
  from_address?: string
  to_address?: string
  transaction_hash?: string
  contract_type?: string
}

interface MoralisNftTransfersResponse {
  result: MoralisNftTransfer[]
  cursor?: string | null
}

// ─── TransactionRecord implementation ────────────────────────────────────────

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

function resolveType(transfer: MoralisNftTransfer): string {
  const from = transfer.from_address?.toLowerCase()
  const to = transfer.to_address?.toLowerCase()

  if (!from || from === ZERO_ADDRESS) return "Mint"
  if (!to || to === ZERO_ADDRESS) return "Burn"
  return "Transfer"
}

export class EvmNftTransactionRecord extends TransactionRecordAbstract {
  private readonly view: TransactionRecordView

  constructor(transfer: MoralisNftTransfer) {
    super()
    this.view = new TransactionRecordView(
      resolveType(transfer),
      transfer.from_address,
      transfer.to_address,
      undefined,
      new Date(transfer.block_timestamp),
    )
  }

  getTransactionView(): TransactionRecordView {
    return this.view
  }
}

// ─── Moralis chain map ────────────────────────────────────────────────────────

const MORALIS_CHAIN_MAP: Partial<Record<number, string>> = {
  [ChainId.ETH]: "eth",
  [ChainId.BASE]: "base",
  [ChainId.POL]: "polygon",
  [ChainId.ARB]: "arbitrum",
  [ChainId.BNB]: "bsc",
}

// ─── Service ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20

class EvmNftTransactionService {
  /**
   * Fetch transfer history for a single NFT from the Moralis API.
   *
   * `page` is 0-based. Moralis uses cursor-based pagination so cursors for
   * subsequent pages are cached internally after the first load.
   */
  async getTransactions(
    chainId: number,
    contract: string,
    tokenId: string,
    page: number,
  ): Promise<NFTTransactions> {
    const chain = MORALIS_CHAIN_MAP[chainId]
    if (!chain) return { activity: [], isLastPage: true }

    const cursor = this.getCursor(chainId, contract, tokenId, page)

    const url = new URL(
      `https://deep-index.moralis.io/api/v2.2/nft/${contract}/${tokenId}/transfers`,
    )
    url.searchParams.set("chain", chain)
    url.searchParams.set("format", "decimal")
    url.searchParams.set("limit", String(PAGE_SIZE))
    if (cursor) url.searchParams.set("cursor", cursor)

    let data: MoralisNftTransfersResponse
    try {
      const resp = await fetch(url.toString(), {
        headers: { "X-API-Key": MORALIS_API_KEY },
      })
      if (!resp.ok) {
        console.error(`Moralis NFT transfers error: ${resp.status}`)
        return { activity: [], isLastPage: true }
      }
      data = await resp.json()
    } catch (e) {
      console.error("Moralis NFT transfers fetch failed:", e)
      return { activity: [], isLastPage: true }
    }

    const nextCursor = data.cursor ?? null
    const isLastPage = !nextCursor

    if (!isLastPage) {
      this.saveCursor(chainId, contract, tokenId, page + 1, nextCursor!)
    }

    return {
      activity: data.result.map((t) => new EvmNftTransactionRecord(t)),
      isLastPage,
    }
  }

  // ─── Cursor cache ───────────────────────────────────────────────────────────

  private readonly cursors = new Map<string, string>()

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
  ): string | undefined {
    if (page === 0) return undefined
    return this.cursors.get(this.cursorKey(chainId, contract, tokenId, page))
  }

  private saveCursor(
    chainId: number,
    contract: string,
    tokenId: string,
    nextPage: number,
    cursor: string,
  ): void {
    this.cursors.set(
      this.cursorKey(chainId, contract, tokenId, nextPage),
      cursor,
    )
  }
}

export const evmNftTransactionService = new EvmNftTransactionService()
