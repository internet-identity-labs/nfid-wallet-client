import React from "react"
import { Route, Routes } from "react-router-dom"
import "tailwindcss/tailwind.css"
import { Usergeek } from "usergeek-ic-js"

import { ic } from "@nfid/integration"

import { RecoverNFIDRoutes } from "./apps/authentication/recover-nfid/routes"
import { ProfileRoutes } from "./apps/identity-manager/profile/routes"
import { OurMission } from "./apps/marketing/landing-page/our-mission"
import { NotFound } from "./ui/pages/404"
import { ScreenResponsive } from "./ui/templates/screen-responsive"

const IDPCoordinator = React.lazy(() => import("./coordination/idp"))
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

declare const USERGEEK_API_KEY: string

if (USERGEEK_API_KEY) {
  Usergeek.init({ apiKey: USERGEEK_API_KEY as string, host: ic.host })
}

export const App = () => (
  <Routes>
    <Route
      path={"/"}
      element={
        <React.Suspense fallback={<div>Loading...</div>}>
          <HomeScreen />
        </React.Suspense>
      }
    />
    <Route
      path={"/faq"}
      element={
        <React.Suspense fallback={<div>Loading...</div>}>
          <Faq />
        </React.Suspense>
      }
    />
    <Route path={"/our-mission"} element={<OurMission />} />

    <Route
      path="/credential/verified-phone-number"
      element={
        <ScreenResponsive frameLabel="Verify with NFID">
          <React.Suspense fallback={<div>Loading...</div>}>
            <PhoneCredentialCoordinator />
          </React.Suspense>
        </ScreenResponsive>
      }
    />

    <Route
      path="/wallet/request-transfer"
      element={
        <React.Suspense fallback={<div>Loading...</div>}>
          <RequestTransferCoordinator />
        </React.Suspense>
      }
    />

    <Route
      path="/wallet/request-accounts"
      element={
        <React.Suspense fallback={<div>Loading...</div>}>
          <RequestAccountsCoordinator />
        </React.Suspense>
      }
    />

    <Route
      path="/authenticate"
      element={
        <ScreenResponsive className="flex flex-col items-center">
          <React.Suspense fallback={<div>Loading...</div>}>
            <IDPCoordinator />
          </React.Suspense>
        </ScreenResponsive>
      }
    />
    <Route
      path="/ridp"
      element={
        <ScreenResponsive className="flex flex-col items-center">
          <React.Suspense fallback={<div>Loading...</div>}>
            <RemoteIDPCoordinator />
          </React.Suspense>
        </ScreenResponsive>
      }
    />

    {ProfileRoutes}
    {RecoverNFIDRoutes}

    <Route path={"*"} element={<NotFound />} />
  </Routes>
)

export default App
