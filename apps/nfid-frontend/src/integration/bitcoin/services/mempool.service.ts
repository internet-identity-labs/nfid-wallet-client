import {
  interval,
  take,
  switchMap,
  of,
  firstValueFrom,
  filter,
  from,
} from "rxjs"

import { TransactionId } from "./chain-fusion-signer.service"

const MAX_ATTEMPTS = 10
const DELAY_MS = 1000
export const REQUIRED_CONFIRMATIONS = 6
export const BLOCK_HEIGHT_URL = `https://mempool.space/api/blocks/tip/height`

export class MempoolService {
  public async checkTransactionAppeared(
    transactionId: TransactionId,
  ): Promise<boolean> {
    const url = `https://mempool.space/api/tx/${transactionId}`

    return firstValueFrom(
      interval(DELAY_MS).pipe(
        take(MAX_ATTEMPTS),
        switchMap(() =>
          from(
            fetch(url)
              .then((response) => response.status === 200)
              .catch(() => false),
          ),
        ),
        switchMap((found, idx) =>
          found
            ? of(true)
            : idx === MAX_ATTEMPTS - 1
              ? of(false)
              : of(undefined),
        ),
        filter((v) => v !== undefined),
      ),
    )
  }

  public async checkWalletConfirmations(
    address: string,
    requiredConfirmations: number = REQUIRED_CONFIRMATIONS,
  ): Promise<boolean> {
    const txsUrl = `https://mempool.space/api/address/${address}/txs`
    try {
      const [txsResponse, blockHeightResponse] = await Promise.all([
        fetch(txsUrl),
        fetch(BLOCK_HEIGHT_URL),
      ])
      if (!txsResponse.ok || !blockHeightResponse.ok) {
        return false
      }

      const txs = await txsResponse.json()
      if (!Array.isArray(txs) || txs.length === 0) {
        return false
      }

      const latestTx = txs[0]
      if (
        !latestTx ||
        !latestTx.status?.confirmed ||
        typeof latestTx.status.block_height !== "number"
      ) {
        return false
      }

      const blockHeight = Number(await blockHeightResponse.text())
      if (isNaN(blockHeight)) {
        return false
      }

      const confirmations = blockHeight - latestTx.status.block_height + 1
      return confirmations >= requiredConfirmations
    } catch (error) {
      console.error("Error checking wallet confirmations:", error)
      return false
    }
  }
}

export const mempoolService = new MempoolService()
