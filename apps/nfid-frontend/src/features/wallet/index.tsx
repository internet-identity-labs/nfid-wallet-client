import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
import { Routes, Route, Navigate } from "react-router-dom"

import ActivityPage from "../activity"
import NFTsPage from "../collectibles"
import TokensPage from "../fungible-token"
import StakingPage from "../staking"
import StakingDetailsPage from "../staking-details"
import { useIdentity } from "frontend/hooks/identity"
import { useEffect } from "react"
import { bridgeService } from "frontend/integration/ethereum/bridge"

export const WalletRouter = () => {
  const { identity } = useIdentity()

  useEffect(() => {
    if (!identity) return
    bridgeService.init(identity)
  }, [identity])

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
