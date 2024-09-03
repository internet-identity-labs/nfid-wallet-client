import { Routes, Route } from "react-router-dom"

import ActivityPage from "../activity"
import ProfileCollectiblesPage from "../collectibles"
import ProfileAssetsPage from "../fungible-token"

export const WalletRouter = () => {
  return (
    <Routes>
      <Route path="tokens" element={<ProfileAssetsPage />} />
      <Route path="nfts" element={<ProfileCollectiblesPage />} />
      <Route path="activity" element={<ActivityPage />} />
    </Routes>
  )
}
