import React from "react"

import { useAllToken } from "frontend/features/fungable-token/use-all-token"
import ProfileAssetsPage from "frontend/ui/pages/new-profile/assets"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

import { ProfileConstants } from "../routes"
import { useAllNFTs } from "./hooks"

const ProfileAssets = () => {
  const { navigate } = useNFIDNavigate()
  const { data: nonFungibleTokens } = useAllNFTs()

  const { token } = useAllToken()
  console.debug("ProfileAssets", { token })

  return (
    <ProfileAssetsPage
      onIconClick={() =>
        navigate(`${ProfileConstants.base}/${ProfileConstants.transactions}`)
      }
      tokens={token}
      nfts={nonFungibleTokens}
    />
  )
}

export default ProfileAssets
