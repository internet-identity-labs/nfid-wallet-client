import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
import { Routes, Route, Navigate } from "react-router-dom"

import ActivityPage from "../activity"
import NFTsPage from "../collectibles"
import TokensPage from "../fungible-token"

export interface TokensPageProps {
  isBtcAddressLoading: boolean
}

export const WalletRouter = ({ isBtcAddressLoading }: TokensPageProps) => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="tokens" replace />} />
      <Route
        path="tokens"
        element={
          <ProfileContainer>
            <TokensPage isBtcAddressLoading={isBtcAddressLoading} />
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
