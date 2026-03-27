import {
  TransactionRecordAbstract,
  TransactionRecordView,
} from "src/integration/nft/impl/nft-transaction-record"
import { NFTTransactions } from "src/integration/nft/impl/nft-types"
import { ALCHEMY_CHAIN_MAP } from "../../constants/constants"

// ─── Alchemy API types ────────────────────────────────────────────────────────

interface AlchemyNftTransfer {
  blockTimestamp: string
  fromAddress?: string
  toAddress?: string
  transactionHash?: string
  category?: string
}

interface AlchemyNftTransfersResponse {
  nftTransfers: AlchemyNftTransfer[]
  pageKey?: string | null
}

// ─── TransactionRecord implementation ────────────────────────────────────────

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

function resolveType(transfer: AlchemyNftTransfer): string {
  const from = transfer.fromAddress?.toLowerCase()
  const to = transfer.toAddress?.toLowerCase()

  if (!from || from === ZERO_ADDRESS) return "Mint"
  if (!to || to === ZERO_ADDRESS) return "Burn"
  return "Transfer"
}

export class EvmNftTransactionRecord extends TransactionRecordAbstract {
  private readonly view: TransactionRecordView

  constructor(transfer: AlchemyNftTransfer) {
    super()
    this.view = new TransactionRecordView(
      resolveType(transfer),
      transfer.fromAddress,
      transfer.toAddress,
      undefined,
      new Date(transfer.blockTimestamp),
    )
  }

  getTransactionView(): TransactionRecordView {
    return this.view
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20

class EvmNftTransactionService {
  async getTransactions(
    chainId: number,
    contract: string,
    tokenId: string,
    page: number,
  ): Promise<NFTTransactions> {
    const network = ALCHEMY_CHAIN_MAP[chainId]
    if (!network) return { activity: [], isLastPage: true }

    const pageKey = this.getCursor(chainId, contract, tokenId, page)

    const url = new URL(
      `https://${network}.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getTransfersForContract`,
    )
    url.searchParams.set("contractAddress", contract)
    url.searchParams.set("tokenId", tokenId)
    url.searchParams.set("limit", String(PAGE_SIZE))
    if (pageKey) url.searchParams.set("pageKey", pageKey)

    let data: AlchemyNftTransfersResponse
    try {
      const resp = await fetch(url.toString())
      if (!resp.ok) {
        console.error(`Alchemy NFT transfers error: ${resp.status}`)
        return { activity: [], isLastPage: true }
      }
      data = await resp.json()
    } catch (e) {
      console.error("Alchemy NFT transfers fetch failed:", e)
      return { activity: [], isLastPage: true }
    }

    const nextPageKey = data.pageKey ?? null
    const isLastPage = !nextPageKey

    if (!isLastPage) {
      this.saveCursor(chainId, contract, tokenId, page + 1, nextPageKey!)
    }

    return {
      activity: data.nftTransfers.map((t) => new EvmNftTransactionRecord(t)),
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
