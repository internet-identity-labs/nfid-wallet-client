import { AnimatePresence, motion } from "framer-motion"
import { Suspense, useEffect, useState, lazy } from "react"
import { Route, Routes, useLocation } from "react-router-dom"
import "tailwindcss/tailwind.css"
import { Usergeek } from "usergeek-ic-js"

import { BlurredLoader, Loader, ScreenResponsive } from "@nfid-frontend/ui"
import { ROUTE_EMBED, ROUTE_RPC } from "@nfid/config"
import { authState, exchangeRateService, ic } from "@nfid/integration"
import { useSWR } from "@nfid/swr"

import { AuthWrapper } from "frontend/ui/pages/auth-wrapper"
import { VaultGuard } from "frontend/ui/pages/vault-guard"
import { walletConnectService } from "frontend/integration/walletconnect"

import { ProfileConstants } from "./apps/identity-manager/profile/routes"
import { BtcAddressProvider } from "./contexts"
import { EthAddressProvider } from "./contexts/eth-address"
import ThirdPartyAuthCoordinator from "./features/authentication/3rd-party/coordinator"
import { AuthEmailMagicLink } from "./features/authentication/auth-selection/email-flow/magic-link-flow"
import IdentityKitRPCCoordinator from "./features/identitykit/coordinator"
import { WalletRouter } from "./features/wallet"
import { WalletConnectHandler } from "./features/walletconnect/walletconnect-handler"
import { WalletConnectModal } from "./features/walletconnect/walletconnect-modal"
import { NotFound } from "./ui/pages/404"
import ProfileTemplate from "./ui/templates/profile-template/Template"
import { useAuthentication } from "./apps/authentication/use-authentication"

const LandingHomePage = lazy(() =>
  import("./apps/marketing/landing-page").then((components) => ({
    default: components.LandingHomePage,
  })),
)

const NFIDEmbedCoordinator = lazy(() => import("./features/embed/coordinator"))

const IframeTrustDeviceCoordinator = lazy(
  () => import("./features/iframe/iframe-trust-device/coordinator"),
)
const ProfileSecurity = lazy(() => import("../src/features/security"))

const ProfilePermissions = lazy(() => import("../src/features/permissions"))

const AddressBookPage = lazy(() => import("../src/features/address-book"))

const CopyRecoveryPhrase = lazy(
  () => import("../src/apps/identity-manager/profile/copy-recovery-phrase"),
)
const VaultsListPage = lazy(
  () => import("frontend/features/vaults/vaults-list-page"),
)
const VaultsDetailsCoordinator = lazy(
  () => import("frontend/features/vaults/vaults-details"),
)
const VaultTransactionsDetailsPage = lazy(
  () =>
    import("frontend/features/vaults/vaults-details/transactions-details-page"),
)

const NFTDetailsPage = lazy(() => import("frontend/features/nft-details"))

if (USERGEEK_API_KEY) {
  Usergeek.init({ apiKey: USERGEEK_API_KEY as string, host: ic.host })
}

export enum NFIDTheme {
  LIGHT = "light",
  DARK = "dark",
  SYSTEM = "system",
}

export const App = () => {
  const [walletTheme, setWalletTheme] = useState<NFIDTheme>(NFIDTheme.SYSTEM)

  const { isAuthenticated } = useAuthentication()

  useEffect(() => {
    const sub = authState.subscribe(({ cacheLoaded }) => {
      const root = document.getElementById("root")
      if (root) {
        root.setAttribute("data-cache-loaded", cacheLoaded.toString())
      }
    })
    return () => sub.unsubscribe()
  }, [])

  useEffect(() => {
    const savedTheme = localStorage.getItem("walletTheme") as NFIDTheme | null
    if (savedTheme) {
      setWalletTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement

    const applyTheme = () => {
      if (walletTheme === NFIDTheme.DARK) {
        root.classList.add("dark")
      } else if (walletTheme === NFIDTheme.LIGHT) {
        root.classList.remove("dark")
      } else if (walletTheme === NFIDTheme.SYSTEM) {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          root.classList.add("dark")
        } else {
          root.classList.remove("dark")
        }
      }
    }

    applyTheme()
    localStorage.setItem("walletTheme", walletTheme)

    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      if (walletTheme === NFIDTheme.SYSTEM) {
        applyTheme()
      }
    }
    mq.addEventListener("change", handleChange)

    return () => mq.removeEventListener("change", handleChange)
  }, [walletTheme])

  useSWR("cacheUSDICPRate", () => exchangeRateService.cacheUsdIcpRate(), {
    dedupingInterval: 60_000,
    focusThrottleInterval: 60_000,
    refreshInterval: 60_000,
    onSuccess: () => {
      console.debug("cacheUsdIcpRate", exchangeRateService.getICP2USD())
    },
  })
  // Initialize WalletConnect on app startup
  useEffect(() => {
    const initWalletConnect = async () => {
      try {
        if (!walletConnectService.getInitialized() && isAuthenticated) {
          await walletConnectService.initialize()
        }
      } catch (error) {
        console.error("Failed to initialize WalletConnect:", error)
      }
    }

    initWalletConnect()

    if (!isAuthenticated) {
      walletConnectService.cleanup().catch((error) => {
        console.error("Failed to cleanup WalletConnect:", error)
      })
    }
    // Cleanup on unmount
    return () => {
      walletConnectService.cleanup().catch((error) => {
        console.error("Failed to cleanup WalletConnect:", error)
      })
    }
  }, [isAuthenticated])

  const location = useLocation()
  const isExcludedFromAnimation = location.pathname.startsWith(
    ProfileConstants.base,
  )

  return (
    <Suspense fallback={<BlurredLoader isLoading />}>
      <WalletConnectHandler />
      <WalletConnectModal />
      <AnimatePresence mode="wait">
        <BtcAddressProvider>
          <EthAddressProvider>
            {isExcludedFromAnimation ? (
              <Routes location={location} key={location.pathname}>
                <Route
                  path={`${ProfileConstants.base}/*`}
                  element={
                    <AuthWrapper>
                      <ProfileTemplate
                        isWallet
                        walletTheme={walletTheme}
                        setWalletTheme={setWalletTheme}
                      />
                    </AuthWrapper>
                  }
                >
                  <Route path="*" element={<WalletRouter />} />
                </Route>
                <Route
                  path={`${ProfileConstants.base}/${ProfileConstants.nfts}/${ProfileConstants.nftDetails}`}
                  element={
                    <AuthWrapper>
                      <NFTDetailsPage
                        walletTheme={walletTheme}
                        setWalletTheme={setWalletTheme}
                      />
                    </AuthWrapper>
                  }
                />
              </Routes>
            ) : (
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Routes location={location} key={location.pathname}>
                  <Route
                    path="/"
                    element={
                      <Suspense
                        fallback={
                          <div className="bg-[#0e0f10] flex justify-center items-center h-[100vh] w-[100vw]">
                            <Loader
                              imageClasses="w-20"
                              isLoading={true}
                              fullscreen={false}
                            />
                          </div>
                        }
                      >
                        <LandingHomePage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/authenticate"
                    element={
                      <ScreenResponsive className="flex flex-col items-center">
                        <ThirdPartyAuthCoordinator />
                      </ScreenResponsive>
                    }
                  />
                  <Route
                    path="/verify/email/:token"
                    element={<AuthEmailMagicLink />}
                  />
                  <Route
                    path="/iframe/trust-device"
                    element={
                      <ScreenResponsive>
                        <IframeTrustDeviceCoordinator />
                      </ScreenResponsive>
                    }
                  />
                  <Route
                    path={ROUTE_EMBED}
                    element={<NFIDEmbedCoordinator />}
                  />
                  <Route
                    path={ROUTE_RPC}
                    element={<IdentityKitRPCCoordinator />}
                  />
                  <Route
                    path={ProfileConstants.security}
                    element={
                      <AuthWrapper>
                        <ProfileSecurity
                          walletTheme={walletTheme}
                          setWalletTheme={setWalletTheme}
                        />
                      </AuthWrapper>
                    }
                  />
                  <Route
                    path={ProfileConstants.permissions}
                    element={
                      <AuthWrapper>
                        <ProfilePermissions
                          walletTheme={walletTheme}
                          setWalletTheme={setWalletTheme}
                        />
                      </AuthWrapper>
                    }
                  />
                  <Route
                    path={ProfileConstants.addressBook}
                    element={
                      <AuthWrapper>
                        <AddressBookPage />
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
                        <NFTDetailsPage
                          walletTheme={walletTheme}
                          setWalletTheme={setWalletTheme}
                        />
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
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </motion.div>
            )}
          </EthAddressProvider>
        </BtcAddressProvider>
      </AnimatePresence>
    </Suspense>
  )
}

export default App
