import { Principal } from "@icp-sdk/core/principal"
import { encodeIcrcAccount } from "@icp-sdk/canisters/ledger/icrc"

import { marketplaceService } from "@nfid/integration/marketplace"

import { RPCMessage } from "../../type"
import { ICRC7TransferMetadata } from "./interfaces"

export const getIcrc37ApproveMetadata = async (
  message: MessageEvent<RPCMessage>,
  args: any,
): Promise<ICRC7TransferMetadata> => {
  const canisterId = message.data.params.canisterId
  const sender = message.data.params.sender

  const [[approveArg]] = JSON.parse(args)
  const tokenId = BigInt(String(approveArg.token_id))

  const spenderOwnerText =
    approveArg.approval_info?.spender?.owner?.__principal__ ??
    approveArg.approval_info?.spender?.owner

  const subaccountOpt: Record<string, number>[] | undefined =
    approveArg.approval_info?.spender?.subaccount
  const subaccountBytes = subaccountOpt?.length
    ? Object.values(subaccountOpt[0])
    : undefined

  const toAddress = encodeIcrcAccount({
    owner: Principal.fromText(spenderOwnerText),
    ...(subaccountBytes ? { subaccount: new Uint8Array(subaccountBytes) } : {}),
  })

  const [collectionMeta, metadataMap] = await Promise.all([
    marketplaceService.getCollectionMetadata(canisterId),
    marketplaceService.getTokenMetadata(canisterId, [tokenId]),
  ])

  const entries = metadataMap.get(tokenId) ?? []
  const getText = (key: string) => {
    const entry = entries.find(([k]) => k === key)
    return entry && "Text" in entry[1] ? entry[1].Text : undefined
  }
  const getFirstText = (keys: string[]) => {
    for (const key of keys) {
      const v = getText(key)
      if (v) return v
    }
    return undefined
  }

  const tokenName =
    getFirstText(["icrc7:name", "name", "icrc97:name"]) ??
    `${collectionMeta.name} #${tokenId}`
  const tokenImage = getFirstText([
    "icrc7:image",
    "image",
    "icrc7:thumbnail",
    "thumbnail",
  ])

  return {
    collectionName: collectionMeta.name,
    collectionLogo: collectionMeta.logo,
    tokenId: tokenId.toString(),
    tokenName,
    tokenImage,
    toAddress,
    sender,
  }
}
