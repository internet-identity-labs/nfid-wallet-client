import { DelegationIdentity } from "@dfinity/identity"

import {
  ecdsaSigner,
  ethereumAsset,
  loadProfileFromLocalStorage,
  replaceActorIdentity,
} from "@nfid/integration"

import { UserNonFungibleToken } from "frontend/features/non-fungable-token/types"
import { transferEXT } from "frontend/integration/entrepot/ext"
import { getWalletDelegation } from "frontend/integration/facade/wallet"
import { fetchProfile } from "frontend/integration/identity-manager"

import { TransferMachineContext } from "../machine"

export const transferNFT = async (context: TransferMachineContext) => {
  if (!context.selectedNFT) throw new Error("No NFT selected")

  const profile = loadProfileFromLocalStorage() ?? (await fetchProfile())

  const identity = await getWalletDelegation(
    profile?.anchor,
    context.selectedNFT.account.domain,
    context.selectedNFT.account.accountId,
  )

  switch (context.selectedNFT?.blockchain) {
    case "Ethereum":
      return transferETH(
        context.selectedNFT.tokenId,
        context.selectedNFT.contractId,
        context.receiverWallet,
        identity,
      )
    default:
      return transferInternetComputer(
        context.selectedNFT,
        context.receiverWallet,
        identity,
      )
  }
}

const transferETH = async (
  tokenId: string,
  contract: string,
  receiver: string,
  identity: DelegationIdentity,
) => {
  try {
    await replaceActorIdentity(ecdsaSigner, identity)
    const res = await ethereumAsset.transferNft(tokenId, contract, receiver)
    console.debug("transferNFT", res)
  } catch (e: any) {
    throw new Error(
      e?.message ?? "Unexpected error: The transaction has been cancelled",
    )
  }
}

const transferInternetComputer = async (
  nft: UserNonFungibleToken,
  to: string,
  identity: DelegationIdentity,
) => {
  try {
    await transferEXT(nft.tokenId, identity, to)
    return `Collectible item “${nft.name}” was sent`
  } catch (e: any) {
    throw new Error(
      e?.message ?? "Unexpected error: The transaction has been cancelled",
    )
  }
}
