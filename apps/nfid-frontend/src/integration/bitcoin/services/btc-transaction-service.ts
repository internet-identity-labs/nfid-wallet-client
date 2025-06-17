import { CKBTC_CANISTER_ID } from "@nfid/integration/token/constants"
import { IActivityAction } from "@nfid/integration/token/icrc1/types"

import { IActivityRow } from "frontend/features/activity/types"

import {
  FungibleActivityRecords,
  FungibleActivityRecord,
} from "../../../../../../packages/integration/src/lib/asset/types"

const mainnet = "https://mempool.space/api/address/"
const testnet = "https://mempool.space/testnet/api/address/"
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
      canister: CKBTC_CANISTER_ID,
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
  const activities: FungibleActivityRecord[] = []
  let url = "mainnet" === CHAIN_NETWORK ? mainnet : testnet
  url += `${address}/txs`

  const response = await fetch(url)
  const json: MempoolTransactionResponse[] = await response.json()

  const records = json.map((tx) => {
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
      price: isReceived ? vout?.value ?? 0 : vin?.prevout.value ?? 0,
    }
  })
  activities.push(...records)
  return { activities }
}

interface MempoolTransactionResponse {
  txid: string
  status: {
    block_time: string
  }
  vin: { prevout: { scriptpubkey_address: string; value: number } }[]
  vout: { scriptpubkey_address: string; value: number }[]
}
