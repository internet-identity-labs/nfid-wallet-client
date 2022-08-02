import { Route, Routes } from "react-router-dom"
import "tailwindcss/tailwind.css"
import { Usergeek } from "usergeek-ic-js"

import "@internet-identity-labs/nfid-sdk-react/dist/styles.css"

import { AppScreenAuthenticateAccountRoutes } from "./apps/authentication/authenticate"
import { RecoverNFIDRoutes } from "./apps/authentication/recover-nfid/routes"
import { AppScreenAuthorizeDerivationOriginAppRoutes } from "./apps/authentication/remote-authentication/routes"
import { AppScreenAuthorizeAppRoutes } from "./apps/authentication/remote-authentication/routes"
import { RemoteNFIDAuthenticationRoutes } from "./apps/authentication/remote-nfid-authentication"
import { ProfileRoutes } from "./apps/identity-manager/profile/routes"
import { HomeScreen } from "./apps/marketing/landing-page"
import { Faq } from "./apps/marketing/landing-page/faq"
import { OurMission } from "./apps/marketing/landing-page/our-mission"
import { RemoteRegisterAccountRoutes } from "./apps/registration/register-account/routes"
import { NFIDRegisterAccountRoutes } from "./apps/registration/register-account/routes"
import IDPCoordinator from "./coordination/idp"
import PhoneCredentialCoordinator from "./coordination/phone-credential"
import RemoteIDPCoordinator from "./coordination/remote-sender"
import { ic } from "./integration/actors"
import { NotFound } from "./ui/pages/404"

declare const USERGEEK_API_KEY: string

if (USERGEEK_API_KEY) {
  Usergeek.init({ apiKey: USERGEEK_API_KEY as string, host: ic.host })
}

export const App = () => {
  return (
    <Routes>
      <Route path={"/"} element={<HomeScreen />} />
      <Route path={"/faq"} element={<Faq />} />
      <Route path={"/our-mission"} element={<OurMission />} />

      <Route
        path="/credential/verified-phone-number"
        element={<PhoneCredentialCoordinator />}
      />

      <Route path="/authenticate" element={<IDPCoordinator />} />
      <Route path="/ridp" element={<RemoteIDPCoordinator />} />

      {ProfileRoutes}
      {RecoverNFIDRoutes}

      {/* Legacy routes that we still need */}
      {NFIDRegisterAccountRoutes}
      {RemoteNFIDAuthenticationRoutes}
      {RemoteRegisterAccountRoutes}

      {/* Legacy routes */}
      {/* {AppScreenAuthorizeAppRoutes} */}
      {/* {AppScreenAuthorizeDerivationOriginAppRoutes} */}

      <Route path={"*"} element={<NotFound />} />
    </Routes>
  )
}

export default App
