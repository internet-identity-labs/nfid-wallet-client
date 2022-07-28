import * as Sentry from "@sentry/react"
import { Route, Routes } from "react-router-dom"
import "tailwindcss/tailwind.css"
import { Usergeek } from "usergeek-ic-js"

import "@internet-identity-labs/nfid-sdk-react/dist/styles.css"

import { AppScreenAuthenticateAccountRoutes } from "./apps/authentication/authenticate"
import { AppScreenAuthorizeDerivationOriginAppRoutes } from "./apps/authentication/remote-authentication/routes"
import { AppScreenAuthorizeAppRoutes } from "./apps/authentication/remote-authentication/routes"
import { RemoteNFIDAuthenticationRoutes } from "./apps/authentication/remote-nfid-authentication"
import { CredentialRoutes } from "./apps/credential-provider/verify-phone-number"
import { ProfileRoutes } from "./apps/identity-manager/profile/routes"
import { HomeScreen } from "./apps/marketing/landing-page"
import { Faq } from "./apps/marketing/landing-page/faq"
import { OurMission } from "./apps/marketing/landing-page/our-mission"
import { RecoverNFIDRoutes } from "./apps/registration/recover-nfid/routes"
import { RemoteRegisterAccountRoutes } from "./apps/registration/register-account/routes"
import { NFIDRegisterAccountRoutes } from "./apps/registration/register-account/routes"
import IDPCoordinator from "./coordination/idp"
import RemoteIDPCoordinator from "./coordination/remote-sender"
import { ic } from "./integration/actors"
import { NotFound } from "./ui/pages/404"

declare const USERGEEK_API_KEY: string

if (USERGEEK_API_KEY) {
  Usergeek.init({ apiKey: USERGEEK_API_KEY as string, host: ic.host })
}

const SentryRoutes = Sentry.withSentryReactRouterV6Routing(Routes)

export const App = () => {
  console.debug("App")
  return (
    <SentryRoutes>
      <Routes>
        <Route path={"/"} element={<HomeScreen />} />
        <Route path={"/faq"} element={<Faq />} />
        <Route path={"/our-mission"} element={<OurMission />} />
        {ProfileRoutes}
        {RemoteRegisterAccountRoutes}
        {NFIDRegisterAccountRoutes}
        {RemoteNFIDAuthenticationRoutes}
        {AppScreenAuthorizeAppRoutes}
        {AppScreenAuthorizeDerivationOriginAppRoutes}
        {RecoverNFIDRoutes}

        {AppScreenAuthenticateAccountRoutes}
        {CredentialRoutes}
        <Route path={"*"} element={<NotFound />} />

        {/* Temporary routes for new machine based flows */}
        <Route path="/idp" element={<IDPCoordinator />} />
        <Route
          path="/ridp/:secret/:maxTimeToLive/:scope"
          element={<RemoteIDPCoordinator />}
        />
        <Route
          path="/ridp/:secret/:maxTimeToLive/:scope/:derivationOrigin"
          element={<RemoteIDPCoordinator />}
        />
      </Routes>
    </SentryRoutes>
  )
}

export default App
