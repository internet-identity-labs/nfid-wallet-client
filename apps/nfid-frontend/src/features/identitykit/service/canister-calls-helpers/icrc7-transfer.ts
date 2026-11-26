import { Principal } from "@icp-sdk/core/principal"
import { encodeIcrcAccount } from "@icp-sdk/canisters/ledger/icrc"

import { marketplaceService } from "@nfid/integration/marketplace"

import { RPCMessage } from "../../type"
import { ICRC7TransferMetadata } from "./interfaces"

export const getIcrc7TransferMetadata = async (
  message: MessageEvent<RPCMessage>,
  args: any,
): Promise<ICRC7TransferMetadata> => {
  const canisterId = message.data.params.canisterId
  const sender = message.data.params.sender

  const [transferArgs] = JSON.parse(args) as [Array<Record<string, unknown>>]
  const firstArg = transferArgs[0]

  const toOwnerText =
    (firstArg.to as any)?.owner?.__principal__ ?? (firstArg.to as any)?.owner

  const subaccountOpt: Record<string, number>[] | undefined = (
    firstArg.to as any
  )?.subaccount
  const subaccountBytes = subaccountOpt?.length
    ? Object.values(subaccountOpt[0])
    : undefined

  const toAddress = encodeIcrcAccount({
    owner: Principal.fromText(toOwnerText),
    ...(subaccountBytes ? { subaccount: new Uint8Array(subaccountBytes) } : {}),
  })

  const tokenIds = transferArgs.map((arg) => BigInt(String(arg.token_id)))

  const [collectionMeta, metadataMap] = await Promise.all([
    marketplaceService.getCollectionMetadata(canisterId),
    marketplaceService.getTokenMetadata(canisterId, tokenIds),
  ])

  const getTokenName = (tokenId: bigint, entries: Array<[string, unknown]>) => {
    const getText = (key: string) => {
      const entry = (entries as Array<[string, { Text?: string }]>).find(
        ([k]) => k === key,
      )
      return entry && "Text" in entry[1] ? entry[1].Text : undefined
    }
    const getFirstText = (keys: string[]) => {
      for (const key of keys) {
        const v = getText(key)
        if (v) return v
      }
      return undefined
    }
    return (
      getFirstText(["icrc7:name", "name", "icrc97:name"]) ??
      `${collectionMeta.name} #${tokenId}`
    )
  }

  const getTokenImage = (entries: Array<[string, unknown]>) => {
    const getText = (key: string) => {
      const entry = (entries as Array<[string, { Text?: string }]>).find(
        ([k]) => k === key,
      )
      return entry && "Text" in entry[1] ? entry[1].Text : undefined
    }
    for (const key of [
      "icrc7:image",
      "image",
      "icrc7:thumbnail",
      "thumbnail",
    ]) {
      const v = getText(key)
      if (v) return v
    }
    return undefined
  }

  const tokens = tokenIds.map((tokenId) => {
    const entries = metadataMap.get(tokenId) ?? []
    return {
      tokenId: tokenId.toString(),
      tokenName: getTokenName(tokenId, entries),
      tokenImage: getTokenImage(entries),
    }
  })

  return {
    collectionName: collectionMeta.name,
    collectionLogo: collectionMeta.logo,
    tokenId: tokens[0].tokenId,
    tokenName: tokens[0].tokenName,
    tokenImage: tokens[0].tokenImage,
    toAddress,
    sender,
    tokens,
  }
}
