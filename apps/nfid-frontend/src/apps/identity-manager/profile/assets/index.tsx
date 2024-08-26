import ProfileAssets from "packages/ui/src/organisms/tokens"
import React from "react"

import { useAllToken } from "frontend/features/fungible-token/use-all-token"
import { AssetFilter } from "frontend/ui/connnector/types"

const ProfileAssetsPage = () => {
  const [assetFilter, setAssetFilter] = React.useState<AssetFilter[]>([])
  const { token, isLoading } = useAllToken(assetFilter)

  console.debug("ProfileAssets", { token })

  return (
    <ProfileAssets
      isLoading={isLoading}
      tokens={token}
      assetFilter={assetFilter}
      setAssetFilter={setAssetFilter}
    />
  )
}

export default ProfileAssetsPage
