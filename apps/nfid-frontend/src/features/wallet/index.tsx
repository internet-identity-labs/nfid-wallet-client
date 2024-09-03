import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
import { Routes, Route } from "react-router-dom"

import ActivityPage from "../activity"
import NFTsPage from "../collectibles"
import TokensPage from "../fungible-token"

export const WalletRouter = () => {
  return (
    <Routes>
      <Route
        path="tokens"
        element={
          <ProfileContainer>
            <TokensPage />
          </ProfileContainer>
        }
      />
      <Route
        path="nfts"
        element={
          <ProfileContainer>
            <NFTsPage />
          </ProfileContainer>
        }
      />
      <Route
        path="activity"
        element={
          <ProfileContainer innerClassName="!px-0">
            <ActivityPage />
          </ProfileContainer>
        }
      />
    </Routes>
  )
}
