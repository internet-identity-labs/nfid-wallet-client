import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
import { Routes, Route } from "react-router-dom"

import ActivityPage from "../activity"
import ProfileCollectiblesPage from "../collectibles"
import ProfileAssetsPage from "../fungible-token"

export const WalletRouter = () => {
  return (
    <Routes>
      <Route
        path="tokens"
        element={
          <ProfileContainer className="relative">
            <ProfileAssetsPage />
          </ProfileContainer>
        }
      />
      <Route
        path="nfts"
        element={
          <ProfileContainer className="relative">
            <ProfileCollectiblesPage />
          </ProfileContainer>
        }
      />
      <Route
        path="activity"
        element={
          <ProfileContainer className="relative" innerClassName="!px-0">
            <ActivityPage />
          </ProfileContainer>
        }
      />
    </Routes>
  )
}
