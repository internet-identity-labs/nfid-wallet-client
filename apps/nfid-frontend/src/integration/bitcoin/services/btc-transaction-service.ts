import { BTC_NATIVE_ID } from "@nfid/integration/token/constants"
import { IActivityAction } from "@nfid/integration/token/icrc1/types"

import { IActivityRow } from "frontend/features/activity/types"

import {
  FungibleActivityRecords,
  FungibleActivityRecord,
} from "../../../../../../packages/integration/src/lib/asset/types"
import { REQUIRED_CONFIRMATIONS } from "./mempool.service"

const mainnet = "https://mempool.space/api/address/"
const BTC_ICON =
  "https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1696501628"

export const getBtcActivitiesRows = async (
  address: string,
): Promise<IActivityRow[]> => {
  const activities = await getFungibleActivityByTokenAndUser(address)
  return activities.activities.map((activity) => ({
    id: activity.id,
    action:
      activity.from === address
        ? IActivityAction.SENT
        : IActivityAction.RECEIVED,
    asset: {
      type: "ft",
      currency: "BTC",
      amount: activity.price,
      icon: BTC_ICON,
      iconTo: BTC_ICON,
      rate: 0,
      decimals: 8,
      decimalsTo: 8,
      canister: BTC_NATIVE_ID,
    },
    type: activity.from === address ? "Sent" : "Received",
    timestamp: new Date(Number(activity.date) * 1000),
    from: activity.from,
    to: activity.to,
  }))
}

async function getFungibleActivityByTokenAndUser(
  address: string,
): Promise<FungibleActivityRecords> {
  const blockHeightUrl = `https://mempool.space/api/blocks/tip/height`
  const activities: FungibleActivityRecord[] = []
  let url = mainnet
  url += `${address}/txs`

  const [tipHeight, json] = await Promise.all([
    fetch(blockHeightUrl).then((res) => res.json()),
    fetch(url).then(
      (res) => res.json() as Promise<MempoolTransactionResponse[]>,
    ),
  ])

  const records = json
    .filter((tx) => {
      if (!tx.status.confirmed || tx.status.block_height === undefined)
        return false

      const confirmations = tipHeight - tx.status.block_height + 1
      return confirmations >= REQUIRED_CONFIRMATIONS
    })
    .map((tx) => {
      const isReceived = tx.vout.some(
        (vout) => vout.scriptpubkey_address === address,
      )
      const isSent = tx.vin.some(
        (vin) => vin.prevout.scriptpubkey_address === address,
      )

      const vout = tx.vout.find((vout) => vout.scriptpubkey_address === address)
      const vin = tx.vin.find(
        (vin) => vin.prevout.scriptpubkey_address === address,
      )

      return {
        id: tx.txid,
        date: tx.status.block_time,
        to: isReceived ? address : tx.vout[0].scriptpubkey_address,
        from: isSent ? address : tx.vin[0].prevout.scriptpubkey_address,
        transactionHash: tx.txid,
        price: isReceived ? (vout?.value ?? 0) : (vin?.prevout.value ?? 0),
      }
    })
  activities.push(...records)
  return { activities }
}

interface MempoolTransactionResponse {
  txid: string
  status: {
    confirmed: boolean
    block_time: string
    block_height?: number
  }
  vin: { prevout: { scriptpubkey_address: string; value: number } }[]
  vout: { scriptpubkey_address: string; value: number }[]
}
