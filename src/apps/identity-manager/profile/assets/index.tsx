import React from "react"

import Dfinity from "frontend/assets/dfinity.svg"
import { icpToUSD } from "frontend/integration/rosetta/queries"
import ProfileAssetsPage from "frontend/ui/pages/new-profile/assets"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

import { ProfileConstants } from "../routes"
import { useWallet } from "../wallet/hooks"
import { useAllNFTs } from "./hooks"

const ProfileAssets = () => {
  const { navigate } = useNFIDNavigate()
  const { walletBalance, walletExchangeRate } = useWallet()
  const { data: nonFungibleTokens } = useAllNFTs()

  const fungibleTokens = React.useMemo(() => {
    if (!walletBalance || !walletExchangeRate) return []
    return [
      {
        icon: Dfinity,
        title: "Internet Computer",
        currency: walletBalance?.currency.symbol,
        balance: `${Number(walletBalance?.value)} ${
          walletBalance.currency.symbol
        }`,
        price: icpToUSD(walletBalance.value, walletExchangeRate),
      },
    ]
  }, [walletBalance, walletExchangeRate])

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
