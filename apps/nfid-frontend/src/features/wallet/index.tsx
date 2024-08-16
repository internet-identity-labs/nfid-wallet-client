import { Routes, Route } from "react-router-dom"

import ProfileAssets from "frontend/apps/identity-manager/profile/assets"

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
