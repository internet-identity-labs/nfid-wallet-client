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
}

export const mempoolService = new MempoolService()
