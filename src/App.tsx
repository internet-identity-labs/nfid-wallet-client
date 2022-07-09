import { Route, Routes } from "react-router-dom"
import "tailwindcss/tailwind.css"
import { Usergeek } from "usergeek-ic-js"

import "@internet-identity-labs/nfid-sdk-react/dist/styles.css"

import { NotFound } from "./design-system/pages/404"
import { AppScreenAuthenticateAccountRoutes } from "./apps/authentication/authenticate"
import { HomeScreen } from "./apps/marketing/landing-page"
import { Faq } from "./apps/marketing/landing-page/faq"
import { OurMission } from "./apps/marketing/landing-page/our-mission"
import { ProfileRoutes } from "./apps/identity-manager/profile/routes"
import { RecoverNFIDRoutes } from "./apps/registration/recover-nfid/routes"
import { RemoteRegisterAccountRoutes } from "./apps/registration/register-account/routes"
import { NFIDRegisterAccountRoutes } from './apps/registration/register-account/routes'
import { AppScreenAuthorizeAppRoutes } from "./apps/authentication/remote-authentication/routes"
import { RemoteNFIDAuthenticationRoutes } from "./apps/authentication/remote-nfid-authentication"
import { CredentialRoutes } from "./apps/credential-provider/verify-phone-number"

import { ic } from "./comm/actors"

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
      {ProfileRoutes}
      {RemoteRegisterAccountRoutes}
      {NFIDRegisterAccountRoutes}
      {RemoteNFIDAuthenticationRoutes}
      {AppScreenAuthorizeAppRoutes}
      {RecoverNFIDRoutes}

      {AppScreenAuthenticateAccountRoutes}
      {CredentialRoutes}
      <Route path={"*"} element={<NotFound />} />
    </Routes>
  )
}

export default App
