import { Route, Routes } from "react-router-dom"
import "tailwindcss/tailwind.css"
import { Usergeek } from "usergeek-ic-js"

import "@internet-identity-labs/nfid-sdk-react/dist/styles.css"

import { NotFound } from "./flows/404"
import { AppScreenAuthenticateAccountRoutes } from "./flows/screens-app/authenticate"
import { HomeScreen } from "./flows/screens-app/landing-page"
import { Faq } from "./flows/screens-app/landing-page/faq"
import { OurMission } from "./flows/screens-app/landing-page/our-mission"
import { LinkIIAnchorRoutes } from "./flows/screens-app/link-ii-anchor/routes"
import { ProfileRoutes } from "./flows/screens-app/profile/routes"
import {
  AppScreenProofOfAttendencyConstants as POAPC,
  AppScreenProofOfAttendencyRoutes,
} from "./flows/screens-app/proof-of-attendancy/routes"
import { RecoverNFIDRoutes } from "./flows/screens-app/recover-nfid/routes"
import {
  NFIDRegisterAccountRoutes,
  RemoteRegisterAccountRoutes,
} from "./flows/screens-app/register-account/routes"
import { RegisterNewDeviceRoutes } from "./flows/screens-app/register-new-from-delegate/routes"
import { AppScreenAuthorizeAppRoutes } from "./flows/screens-app/remote-authentication/routes"
import { RemoteNFIDAuthenticationRoutes } from "./flows/screens-app/remote-nfid-authentication"

import { useStartUrl } from "./hooks/use-start-url"

import { ic } from "./api/actors"

declare const USERGEEK_API_KEY: string

if (USERGEEK_API_KEY) {
  Usergeek.init({ apiKey: USERGEEK_API_KEY as string, host: ic.host })
}

export const App = () => {
  useStartUrl()

  return (
    <Routes>
      <Route path={"/"} element={<HomeScreen />} />
      <Route path={"/faq"} element={<Faq />} />
      <Route path={"/our-mission"} element={<OurMission />} />
      {LinkIIAnchorRoutes}
      {ProfileRoutes}
      {RegisterNewDeviceRoutes}
      {RemoteRegisterAccountRoutes}
      {NFIDRegisterAccountRoutes}
      {RemoteNFIDAuthenticationRoutes}
      {AppScreenAuthorizeAppRoutes}
      {AppScreenProofOfAttendencyRoutes(`${POAPC.base}/${POAPC.register}`)}
      {RecoverNFIDRoutes}

      {AppScreenAuthenticateAccountRoutes}
      <Route path={"*"} element={<NotFound />} />
    </Routes>
  )
}

export default App
