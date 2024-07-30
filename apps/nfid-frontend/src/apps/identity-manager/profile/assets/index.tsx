import React from "react"

import { useAllToken } from "frontend/features/fungible-token/use-all-token"
import { AssetFilter } from "frontend/ui/connnector/types"
import ProfileAssetsPage from "frontend/ui/pages/new-profile/assets"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

import { ProfileConstants } from "../routes"

const ProfileAssets = () => {
  const [assetFilter, setAssetFilter] = React.useState<AssetFilter[]>([])
  const { navigate } = useNFIDNavigate()
  const { token, isLoading } = useAllToken(assetFilter)

  console.debug("ProfileAssets", { token })

  return (
    <ProfileAssetsPage
      onIconClick={() =>
        navigate(`${ProfileConstants.base}/${ProfileConstants.transactions}`)
      }
      isLoading={isLoading}
      tokens={token}
      assetFilter={assetFilter}
      setAssetFilter={setAssetFilter}
    />
  )
}

export default ProfileAssets
