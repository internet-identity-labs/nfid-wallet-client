import React from "react"

import { useAllToken } from "frontend/features/fungable-token/use-all-token"
import ProfileAssetsPage from "frontend/ui/pages/new-profile/assets"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

import { ProfileConstants } from "../routes"
import { useAllNFTs } from "./hooks"

const ProfileAssets = () => {
  const [accountsFilter, setAccountsFilter] = React.useState<string[]>([])
  const { navigate } = useNFIDNavigate()
  const { nfts: nonFungibleTokens } = useAllNFTs(accountsFilter)
  const { token } = useAllToken(accountsFilter)

  console.debug("ProfileAssets", { token })

  return (
    <ProfileAssetsPage
      onIconClick={() =>
        navigate(`${ProfileConstants.base}/${ProfileConstants.transactions}`)
      }
      tokens={token}
      nfts={nonFungibleTokens}
      accountsFilter={accountsFilter}
      setAccountsFilter={setAccountsFilter}
    />
  )
}

export default ProfileAssets
