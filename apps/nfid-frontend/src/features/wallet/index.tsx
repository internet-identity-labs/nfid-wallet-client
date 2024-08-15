import { Routes, Route } from "react-router-dom"

import ProfileAssets from "frontend/apps/identity-manager/profile/assets"
import { AssetFilter } from "frontend/ui/connnector/types"
import { NotFound } from "frontend/ui/pages/404"
import ProfileAssetsPage from "frontend/ui/pages/new-profile/assets"

import ActivityPage from "../activity"
import ProfileCollectiblesPage from "../collectibles"

export const WalletRouter = () => {
  return (
    <Routes>
      <Route path="tokens" element={<ProfileAssets />} />
      <Route path="nfts" element={<ProfileCollectiblesPage />} />
      <Route path="activity" element={<ActivityPage />} />
    </Routes>
  )
}
