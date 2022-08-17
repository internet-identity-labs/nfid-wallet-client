import React from "react"

import ProfileAssetsPage from "frontend/ui/pages/new-profile/assets"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

import { ProfileConstants } from "./routes"

const ProfileAssets = () => {
  const { navigate } = useNFIDNavigate()

  return (
    <ProfileAssetsPage
      onIconClick={() =>
        navigate(`${ProfileConstants.base}/${ProfileConstants.transactions}`)
      }
      tokens={[]}
    />
  )
}

export default ProfileAssets
