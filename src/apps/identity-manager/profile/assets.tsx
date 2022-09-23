import React from "react"

import Dfinity from "frontend/assets/dfinity.svg"
import ProfileAssetsPage from "frontend/ui/pages/new-profile/assets"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

import { ProfileConstants } from "./routes"
import { useWallet } from "./wallet/hooks"

const ProfileAssets = () => {
  const { navigate } = useNFIDNavigate()
  const { walletBalance, walletExchangeRate } = useWallet()

  const tokens = React.useMemo(() => {
    if (!walletBalance || !walletExchangeRate) return []
    return [
      {
        icon: Dfinity,
        title: "Internet Computer",
        currency: walletBalance?.currency.symbol,
        balance: `${Number(walletBalance?.value)} ${
          walletBalance.currency.symbol
        }`,
        price: walletExchangeRate * Number(walletBalance.value),
      },
    ]
  }, [walletBalance, walletExchangeRate])

  return (
    <ProfileAssetsPage
      onIconClick={() =>
        navigate(`${ProfileConstants.base}/${ProfileConstants.transactions}`)
      }
      tokens={tokens}
      nfts={[]}
    />
  )
}

export default ProfileAssets
