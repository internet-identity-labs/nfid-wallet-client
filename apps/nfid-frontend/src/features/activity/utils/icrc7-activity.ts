import { ActivityAssetNFT } from "packages/integration/src/lib/asset/types"

import { authState } from "@nfid/integration"
import {
  Icrc7EventWithToken,
  icrc7HistoryService,
  marketplaceService,
  NftCollection,
} from "@nfid/integration/marketplace"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { IActivityAction } from "@nfid/integration/token/icrc1/types"

import { IActivityRow } from "../types"
import { nanoSecondsToDate } from "./activity"

const E8S = 100_000_000

export const formatIcp = (e8s: bigint): string => {
  const whole = e8s / BigInt(E8S)
  const fraction = (e8s % BigInt(E8S))
    .toString()
    .padStart(8, "0")
    .replace(/0+$/, "")
  return `${whole}${fraction ? `.${fraction}` : ""} ICP`
}

const getAction = (
  event: Icrc7EventWithToken,
  user: string,
): IActivityAction => {
  switch (event.kind) {
    case "mint":
      return IActivityAction.MINT
    case "burn":
      return IActivityAction.BURN
    case "approve":
      return IActivityAction.APPROVE
    case "sale":
      return event.from === user ? IActivityAction.SELL : IActivityAction.BUY
    case "transfer":
      return event.from === user
        ? IActivityAction.SENT
        : IActivityAction.RECEIVED
  }
}

export const mapIcrc7EventToRow = (
  event: Icrc7EventWithToken,
  user: string,
  collection?: NftCollection,
): IActivityRow => {
  const collectionName = collection?.name ?? event.collectionId
  const asset: ActivityAssetNFT = {
    type: "nft",
    name: event.token.name ?? `${collectionName} #${event.tokenId}`,
    preview: event.token.image ?? collection?.logo ?? "",
    previewType: "img",
    amount:
      event.priceE8s !== undefined ? formatIcp(event.priceE8s) : undefined,
    canister: event.collectionId,
    chainId: ChainId.ICP,
    collectionName,
  }

  return {
    // Block ids repeat across collections.
    id: `icrc7:${event.collectionId}:${event.blockId}`,
    action: getAction(event, user),
    timestamp: nanoSecondsToDate(event.timestamp),
    asset,
    from: event.from ?? "",
    to: (event.kind === "approve" ? event.spender : event.to) ?? "",
  }
}

/**
 * ICRC-7 activity of `address` (the wallet principal by default) in the
 * collections registered in the marketplace, except Spam and Hidden ones.
 */
export const getIcrc7ActivitiesRows = async (
  limit: number,
  address?: string,
): Promise<IActivityRow[]> => {
  try {
    const user = address ?? authState.getUserIdData().publicKey
    const collections = (await marketplaceService.getCollections()).filter(
      (c) => c.status !== "Spam" && c.status !== "Hidden",
    )
    if (!collections.length) return []

    const byId = new Map(collections.map((c) => [c.canisterId, c]))
    const events = await icrc7HistoryService.getUserEvents(
      collections.map((c) => c.canisterId),
      user,
    )
    return events
      .slice(0, limit)
      .map((e) => mapIcrc7EventToRow(e, user, byId.get(e.collectionId)))
  } catch (e) {
    console.error("Failed to load ICRC-7 activity", e)
    return []
  }
}
