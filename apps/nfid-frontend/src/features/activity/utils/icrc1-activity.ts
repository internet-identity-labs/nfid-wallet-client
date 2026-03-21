import {
  Activity,
  ActivityAssetFT,
} from "packages/integration/src/lib/asset/types"

import { authState } from "@nfid/integration"
import { getICRC1HistoryDataForUser } from "@nfid/integration/token/icrc1"
import { icrc1OracleService } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"
import { icrc1TransactionHistoryService } from "@nfid/integration/token/icrc1/service/icrc1-transaction-history-service"
import {
  ICRC1IndexData,
  TransactionData,
} from "@nfid/integration/token/icrc1/types"

import { IActivityRow } from "../types"
import { nanoSecondsToDate } from "./activity"
import { Category, ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import {
  CKBTC_CANISTER_ID,
  CKETH_LEDGER_CANISTER_ID,
  ICP_EXPLORER,
} from "@nfid/integration/token/constants"
import { FT } from "frontend/integration/ft/ft"

const getChainFusionTokenName = (address: string) => {
  if (address === CKBTC_CANISTER_ID) {
    return "bitcoin"
  } else if (address === CKETH_LEDGER_CANISTER_ID) {
    return "ethereum"
  } else {
    return `ethereum/${address}`
  }
}

export const getExplorerLink = (id: string, token: ActivityAssetFT) => {
  if (token.category === Category.Native) {
    return `${ICP_EXPLORER}/transaction/${id}`
  } else if (token.category === Category.Sns) {
    return `${ICP_EXPLORER}/sns/${token.rootCanister}/transaction/${id}`
  } else if (token.category === Category.ChainFusion) {
    return `${ICP_EXPLORER}/${getChainFusionTokenName(
      token.canister,
    )}/transaction/${id}`
  }
}

const getAllTransactions = (
  allCanistersActivities: ICRC1IndexData[],
): TransactionData[] =>
  allCanistersActivities.flatMap((activity) => activity.transactions)

const getActivities = async (
  limit: number,
  activeTokens: FT[],
): Promise<Activity[]> => {
  const { userId, publicKey } = authState.getUserIdData()
  const allCanistersActivities = await getICRC1HistoryDataForUser(
    userId!,
    publicKey,
    BigInt(limit),
  )

  return getAllTransactions(allCanistersActivities).map(
    (tx: TransactionData) => {
      const token = activeTokens.find(
        (t) => t.getTokenAddress() === tx.canister,
      )

      return {
        id: tx.transactionId.toString(),
        date: new Date(nanoSecondsToDate(tx.timestamp)),
        from: tx.from,
        to: tx.to,
        transactionHash: tx.transactionId.toString(),
        action: tx.type,
        asset: {
          type: "ft",
          currency: tx.symbol,
          decimals: tx.decimals,
          amount: Number(tx.amount),
          canister: tx.canister,
          chainId: ChainId.ICP,
          category: token?.getTokenCategory(),
          rootCanister: token?.getRootSnsCanister(),
        },
      } as Activity
    },
  )
}

const mapActivitiesToRows = (activities: Activity[]): IActivityRow[] =>
  activities.map((activity) => ({
    id: activity.id,
    action: activity.action,
    asset: activity.asset,
    type: activity.asset.type,
    timestamp: activity.date,
    from: activity.from,
    to: activity.to,
    scanLink: getExplorerLink(activity.id, activity.asset as ActivityAssetFT),
  }))

export const getIcrc1ActivitiesRows = async (
  limit: number,
  activeTokens: FT[],
): Promise<IActivityRow[]> => {
  const activities = await getActivities(limit, activeTokens)
  return mapActivitiesToRows(activities)
}

export const getIcpViewOnlyActivitiesRows = async (
  address: string,
  limit: number,
  activeTokens: FT[],
): Promise<IActivityRow[]> => {
  try {
    const oracleTokens = await icrc1OracleService.getICRC1Canisters()
    const activeAddresses = new Set(
      activeTokens.map((t) => t.getTokenAddress()),
    )
    const indexedCanisters = oracleTokens
      .filter((t) => activeAddresses.has(t.ledger) && t.index[0] !== undefined)
      .map((t) => ({
        icrc1: { ledger: t.ledger, index: t.index[0]! },
        blockNumberToStartFrom: undefined,
      }))

    if (!indexedCanisters.length) return []

    const allCanistersActivities =
      await icrc1TransactionHistoryService.getICRC1IndexData(
        indexedCanisters,
        address,
        BigInt(limit),
      )

    const activities = getAllTransactions(allCanistersActivities).map(
      (tx: TransactionData) => {
        const token = activeTokens.find(
          (t) => t.getTokenAddress() === tx.canister,
        )
        return {
          id: tx.transactionId.toString(),
          date: new Date(nanoSecondsToDate(tx.timestamp)),
          from: tx.from,
          to: tx.to,
          transactionHash: tx.transactionId.toString(),
          action: tx.type,
          asset: {
            type: "ft",
            currency: tx.symbol,
            decimals: tx.decimals,
            amount: Number(tx.amount),
            canister: tx.canister,
            chainId: ChainId.ICP,
            category: token?.getTokenCategory(),
            rootCanister: token?.getRootSnsCanister(),
          },
        } as Activity
      },
    )
    return mapActivitiesToRows(activities)
  } catch {
    return []
  }
}
