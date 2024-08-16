import React from "react"

import { useAllToken } from "frontend/features/fungible-token/use-all-token"
import { AssetFilter } from "frontend/ui/connnector/types"
import ProfileAssetsPage from "frontend/ui/pages/new-profile/assets"

const ProfileAssets = () => {
  const [assetFilter, setAssetFilter] = React.useState<AssetFilter[]>([])
  const { token, isLoading } = useAllToken(assetFilter)

  console.debug("ProfileAssets", { token })

  return (
    <ProfileAssetsPage
      isLoading={isLoading}
      tokens={token}
      assetFilter={assetFilter}
      setAssetFilter={setAssetFilter}
    />
  )
}

export default ProfileAssets
