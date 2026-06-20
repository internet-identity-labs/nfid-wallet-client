import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
import { Routes, Route, Navigate } from "react-router-dom"

import ActivityPage from "../activity"
import NFTsPage from "../collectibles"
import TokensPage from "../fungible-token"
import StakingPage from "../staking"
import EarnPage from "../earn"
import StakingDetailsPage from "../staking-details"
import { useIdentity } from "frontend/hooks/identity"
import { useContext, useEffect } from "react"
import { bridgeService } from "frontend/integration/ethereum/bridge"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import EarnDetailsPage from "../earn-details"
import { ProfileContext } from "frontend/provider"

export const WalletRouter = () => {
  const { isViewOnlyMode } = useContext(ProfileContext)
  const { identity } = useIdentity(isViewOnlyMode)

  useEffect(() => {
    if (!identity) return
    bridgeService.init(identity)
  }, [identity])

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={ProfileConstants.tokens} replace />}
      />
      <Route path={ProfileConstants.tokens} element={<TokensPage />} />
      <Route path={ProfileConstants.nfts} element={<NFTsPage />} />
      <Route path={ProfileConstants.staking} element={<StakingPage />} />
      <Route path={ProfileConstants.earn} element={<EarnPage />} />
      <Route
        path={`${ProfileConstants.staking}/:tokenSymbol`}
        element={<StakingDetailsPage />}
      />
      <Route
        path={`${ProfileConstants.earn}/:chainId/:asset`}
        element={<EarnDetailsPage />}
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
