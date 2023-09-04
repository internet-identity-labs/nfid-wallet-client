import React from "react"
import { Route, Routes } from "react-router-dom"
import "tailwindcss/tailwind.css"
import { Usergeek } from "usergeek-ic-js"

import { BlurredLoader, ScreenResponsive } from "@nfid-frontend/ui"
import { ROUTE_EMBED } from "@nfid/config"
import { authState, ic } from "@nfid/integration"

import Logo from "./assets/metamask.svg"

import { RecoverNFIDRoutes } from "./apps/authentication/recover-nfid/routes"
import { ProfileRoutes } from "./apps/identity-manager/profile/routes"
import ThirdPartyAuthCoordinator from "./features/authentication/3rd-party/coordinator"
import { AuthEmailMagicLink } from "./features/authentication/auth-selection/email-flow/magic-link-flow"
import { RequestTransfer } from "./features/request-transfer"
import { NotFound } from "./ui/pages/404"

const HomeScreen = React.lazy(() => import("./apps/marketing/landing-page"))

const RequestTransferCoordinator = React.lazy(
  () => import("./coordination/wallet/request-transfer"),
)
const RequestAccountsCoordinator = React.lazy(
  () => import("./coordination/wallet/request-accounts"),
)

const NFIDEmbedCoordinator = React.lazy(
  () => import("./features/embed/coordinator"),
)

const IframeTrustDeviceCoordinator = React.lazy(
  () => import("./features/iframe/iframe-trust-device/coordinator"),
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
        <Route
          path="/request-transfer"
          element={
            <ScreenResponsive className="overflow-auto">
              <RequestTransfer
                amount={0.1}
                appMeta={{ logo: Logo, url: "metamask.io" }}
              />
            </ScreenResponsive>
          }
        />
        <Route path={"/"} element={<HomeScreen />} />

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
