import { loadProfileFromLocalStorage } from "@nfid/integration"

import { UserNonFungibleToken } from "frontend/features/non-fungable-token/types"
import { transferEXT } from "frontend/integration/entrepot/ext"
import { getWalletDelegation } from "frontend/integration/facade/wallet"
import { fetchProfile } from "frontend/integration/identity-manager"

import { TransferMachineContext } from "../machine"

export const transferNFT = async (context: TransferMachineContext) => {
  if (!context.selectedNFT) throw new Error("No NFT selected")

  switch (context.selectedNFT?.blockchain) {
    case "Ethereum":
      return transferETH()
    default:
      return transferInternetComputer(
        context.selectedNFT,
        context.receiverWallet,
      )
  }
}

const transferETH = async () => {}

const transferInternetComputer = async (
  nft: UserNonFungibleToken,
  to: string,
) => {
  const profile = loadProfileFromLocalStorage() ?? (await fetchProfile())

  const identity = await getWalletDelegation(
    profile?.anchor,
    nft.account.domain,
    nft.account.accountId,
  )

  try {
    transferEXT(nft.tokenId, identity, to)
    return `Collectible item “${nft.name}” was sent`
  } catch (e: any) {
    throw new Error(e?.message)
  }
}
