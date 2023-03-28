import { IGroupedOptions, IGroupOption } from "@nfid-frontend/ui"
import { Application, getWalletName } from "@nfid/integration"

import { UserNFTDetails } from "frontend/integration/entrepot/types"

export const mapUserNFTDetailsToGroupedOptions = (
  userNFTDetailsArray: UserNFTDetails[],
  applications: Application[],
): IGroupedOptions[] => {
  // First, group the UserNFTDetails by wallet name
  const groupedByWallet = userNFTDetailsArray.reduce(
    (acc: { [key: string]: UserNFTDetails[] }, current) => {
      const walletName = getWalletName(
        applications,
        current.account.domain,
        current.account.accountId,
      )
      if (!acc[walletName]) {
        acc[walletName] = []
      }
      acc[walletName].push(current)
      return acc
    },
    {},
  )

  // Then, map each group to an IGroupedOptions object
  const mappedGroups = Object.entries(groupedByWallet).map(
    ([walletName, userNFTDetails]) => {
      const options = userNFTDetails.map(
        (nft) =>
          ({
            title: nft.name,
            subTitle: nft.collection.name,
            value: nft.tokenId,
            icon: nft.assetPreview,
          } as IGroupOption),
      )
      return {
        label: walletName,
        options,
      }
    },
  )

  return mappedGroups
}
