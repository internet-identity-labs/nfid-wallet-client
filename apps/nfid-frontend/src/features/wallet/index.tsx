import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
import { Routes, Route, Navigate } from "react-router-dom"

import ActivityPage from "../activity"
import NFTsPage from "../collectibles"
import TokensPage from "../fungible-token"

interface WalletRouterProps {
  triedToComplete: (value: boolean) => void
}

export const WalletRouter = ({ triedToComplete }: WalletRouterProps) => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="tokens" replace />} />
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
            <ActivityPage triedToComplete={triedToComplete} />
          </ProfileContainer>
        }
      />
    </Routes>
  )
}
