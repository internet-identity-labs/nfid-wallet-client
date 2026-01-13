import { Routes, Route, Navigate } from "react-router-dom"

import ProfileContainer from "@nfid/ui/atoms/profile-container/Container"

import ActivityPage from "../activity"
import NFTsPage from "../collectibles"
import TokensPage from "../fungible-token"
import StakingPage from "../staking"
import StakingDetailsPage from "../staking-details"

export const WalletRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="tokens" replace />} />
      <Route path="tokens" element={<TokensPage />} />
      <Route path="nfts" element={<NFTsPage />} />
      <Route path="staking" element={<StakingPage />} />
      <Route path="staking/:tokenSymbol" element={<StakingDetailsPage />} />
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
