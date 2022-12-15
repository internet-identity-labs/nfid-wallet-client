import React from "react"

import Dfinity from "frontend/assets/dfinity.svg"
import { useBalanceICPAll } from "frontend/features/fungable-token/icp/hooks/use-balance-icp-all"
import ProfileAssetsPage from "frontend/ui/pages/new-profile/assets"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

import { ProfileConstants } from "../routes"
import { useAllNFTs } from "./hooks"

const ProfileAssets = () => {
  const { navigate } = useNFIDNavigate()
  const { appAccountBalance } = useBalanceICPAll()
  const { data: nonFungibleTokens } = useAllNFTs()

  const fungibleTokens = React.useMemo(() => {
    if (!appAccountBalance) return []

    return [
      {
        icon: Dfinity,
        title: appAccountBalance.label,
        currency: appAccountBalance.token,
        balance: appAccountBalance.tokenBalance,
        price: appAccountBalance.usdBalance,
      },
    ]
  }, [appAccountBalance])

  return (
    <ProfileAssetsPage
      onIconClick={() =>
        navigate(`${ProfileConstants.base}/${ProfileConstants.transactions}`)
      }
      tokens={fungibleTokens}
      nfts={nonFungibleTokens}
    />
  )
}

export default ProfileAssets
