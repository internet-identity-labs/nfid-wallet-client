import React from "react"
import { Route, Routes } from "react-router-dom"
import "tailwindcss/tailwind.css"
import { Usergeek } from "usergeek-ic-js"

import { BlurredLoader, ScreenResponsive } from "@nfid-frontend/ui"
import { ROUTE_EMBED } from "@nfid/config"
import { authState, ic } from "@nfid/integration"

import { RecoverNFIDRoutes } from "./apps/authentication/recover-nfid/routes"
import { ProfileRoutes } from "./apps/identity-manager/profile/routes"
import { AuthEmailMagicLink } from "./features/authentication/magic-link-flow"
import { NotFound } from "./ui/pages/404"

const AuthenticationCoordinator = React.lazy(
  () => import("./features/authentication/coordinator"),
)
const HomeScreen = React.lazy(() => import("./apps/marketing/landing-page"))
const Faq = React.lazy(() => import("./apps/marketing/landing-page/faq"))
const PhoneCredentialCoordinator = React.lazy(
  () => import("./coordination/phone-credential"),
)
const RequestTransferCoordinator = React.lazy(
  () => import("./coordination/wallet/request-transfer"),
)
const RequestAccountsCoordinator = React.lazy(
  () => import("./coordination/wallet/request-accounts"),
)
const RemoteIDPCoordinator = React.lazy(
  () => import("./coordination/remote-sender"),
)

const NFIDEmbedCoordinator = React.lazy(
  () => import("./features/embed/coordinator"),
)

const IframeTrustDeviceCoordinator = React.lazy(
  () => import("./features/iframe/iframe-trust-device/coordinator"),
)

const OurMission = React.lazy(
  () => import("./apps/marketing/landing-page/our-mission"),
)

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

  return (
    <React.Suspense fallback={<BlurredLoader isLoading />}>
      <Routes>
        <Route path={"/"} element={<HomeScreen />} />
        <Route path={"/faq"} element={<Faq />} />
        <Route
          path={"/our-mission"}
          element={
            <React.Suspense>
              <OurMission />
            </React.Suspense>
          }
        />

        <Route
          path="/credential/verified-phone-number"
          element={
            <ScreenResponsive frameLabel="Verify with NFID">
              <PhoneCredentialCoordinator />
            </ScreenResponsive>
          }
        />

        <Route
          path="/wallet/request-transfer"
          element={<RequestTransferCoordinator />}
        />

        <Route
          path="/wallet/request-accounts"
          element={<RequestAccountsCoordinator />}
        />

        <Route
          path="/authenticate"
          element={
            <ScreenResponsive className="flex flex-col items-center">
              <AuthenticationCoordinator />
            </ScreenResponsive>
          }
        />

        <Route path="/verify/email/:token" element={<AuthEmailMagicLink />} />

        <Route
          path="/ridp"
          element={
            <ScreenResponsive className="flex flex-col items-center">
              <RemoteIDPCoordinator />
            </ScreenResponsive>
          }
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
          element={
            <ScreenResponsive className="overflow-auto">
              <NFIDEmbedCoordinator />
            </ScreenResponsive>
          }
        />

        {ProfileRoutes}
        {RecoverNFIDRoutes}

        <Route path={"*"} element={<NotFound />} />
      </Routes>
    </React.Suspense>
  )
}

export default App
