import React from "react"
import { Route, Routes } from "react-router-dom"
import useSWR from "swr"
import "tailwindcss/tailwind.css"
import { Usergeek } from "usergeek-ic-js"

import { BlurredLoader, ScreenResponsive } from "@nfid-frontend/ui"
import { ROUTE_EMBED, ROUTE_RPC } from "@nfid/config"
import { authState, exchangeRateService, ic } from "@nfid/integration"

import { AuthWrapper } from "frontend/ui/pages/auth-wrapper"
import { VaultGuard } from "frontend/ui/pages/vault-guard"

import { RecoverNFIDRoutes } from "./apps/authentication/recover-nfid/routes"
import { ProfileConstants } from "./apps/identity-manager/profile/routes"
import ThirdPartyAuthCoordinator from "./features/authentication/3rd-party/coordinator"
import { AuthEmailMagicLink } from "./features/authentication/auth-selection/email-flow/magic-link-flow"
import IdentityKitRPCCoordinator from "./features/identitykit/coordinator"
import { WalletRouter } from "./features/wallet"
import { NotFound } from "./ui/pages/404"
import ProfileTemplate from "./ui/templates/profile-template/Template"

const HomeScreen = React.lazy(() => import("./apps/marketing/landing-page"))

const NFIDEmbedCoordinator = React.lazy(
  () => import("./features/embed/coordinator"),
)

const IframeTrustDeviceCoordinator = React.lazy(
  () => import("./features/iframe/iframe-trust-device/coordinator"),
)
const ProfileSecurity = React.lazy(() => import("../src/features/security"))
const CopyRecoveryPhrase = React.lazy(
  () => import("../src/apps/identity-manager/profile/copy-recovery-phrase"),
)
const VaultsListPage = React.lazy(
  () => import("frontend/features/vaults/vaults-list-page"),
)
const VaultsDetailsCoordinator = React.lazy(
  () => import("frontend/features/vaults/vaults-details"),
)
const VaultTransactionsDetailsPage = React.lazy(
  () =>
    import("frontend/features/vaults/vaults-details/transactions-details-page"),
)

const NFTDetailsPage = React.lazy(() => import("frontend/features/nft-details"))

if (USERGEEK_API_KEY) {
  Usergeek.init({ apiKey: USERGEEK_API_KEY as string, host: ic.host })
}

export const App = () => {
  React.useEffect(() => {
    const sub = authState.subscribe(({ cacheLoaded }) => {
      const root = document.getElementById("root")
      if (root) {
        root.setAttribute("data-cache-loaded", cacheLoaded.toString())
      }
    })
    return () => sub.unsubscribe()
  }, [])

  useSWR("cacheUSDICPRate", () => exchangeRateService.cacheUsdIcpRate(), {
    dedupingInterval: 60_000,
    focusThrottleInterval: 60_000,
    refreshInterval: 60_000,
    onSuccess: (data) => {
      console.debug("cacheUsdIcpRate", exchangeRateService.getICP2USD())
    },
  })

  return (
    <React.Suspense fallback={<BlurredLoader isLoading />}>
      <Routes>
        <Route path={"/"} element={<HomeScreen />} />

        <Route
          path="/authenticate"
          element={
            <ScreenResponsive className="flex flex-col items-center">
              <ThirdPartyAuthCoordinator />
            </ScreenResponsive>
          }
        />

        <Route path="/verify/email/:token" element={<AuthEmailMagicLink />} />

        <Route
          path="/iframe/trust-device"
          element={
            <ScreenResponsive>
              <IframeTrustDeviceCoordinator />
            </ScreenResponsive>
          }
        />

        <Route path={ROUTE_EMBED} element={<NFIDEmbedCoordinator />} />
        <Route path={ROUTE_RPC} element={<IdentityKitRPCCoordinator />} />

        <Route
          path={`${ProfileConstants.base}/*`}
          element={
            <AuthWrapper>
              <ProfileTemplate isWallet />
            </AuthWrapper>
          }
        >
          <Route path="*" element={<WalletRouter />} />
        </Route>
        <Route
          path={ProfileConstants.security}
          element={
            <AuthWrapper>
              <ProfileSecurity />
            </AuthWrapper>
          }
        />
        <Route
          path={ProfileConstants.copyRecoveryPhrase}
          element={
            <AuthWrapper>
              <CopyRecoveryPhrase />
            </AuthWrapper>
          }
        />
        <Route
          path={`${ProfileConstants.vaults}`}
          element={
            <AuthWrapper>
              <VaultGuard>
                <VaultsListPage />
              </VaultGuard>
            </AuthWrapper>
          }
        />
        <Route
          path={`${ProfileConstants.vaults}/${ProfileConstants.vault}`}
          element={
            <AuthWrapper>
              <VaultsDetailsCoordinator />
            </AuthWrapper>
          }
        />
        <Route
          path={`${ProfileConstants.base}/${ProfileConstants.nfts}/${ProfileConstants.nftDetails}`}
          element={
            <AuthWrapper>
              <NFTDetailsPage />
            </AuthWrapper>
          }
        />
        <Route
          path={`${ProfileConstants.vaults}/transactions/${ProfileConstants.vaultTransaction}`}
          element={
            <AuthWrapper>
              <VaultTransactionsDetailsPage />
            </AuthWrapper>
          }
        />
        {RecoverNFIDRoutes}
        <Route path={"*"} element={<NotFound />} />
      </Routes>
    </React.Suspense>
  )
}

export default App
