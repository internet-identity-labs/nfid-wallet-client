import { Route, Routes } from "react-router-dom"
import "tailwindcss/tailwind.css"
import { Usergeek } from "usergeek-ic-js"

import { ScreenResponsive } from "@nfid-frontend/ui"
import { ic } from "@nfid/integration"

import { RecoverNFIDRoutes } from "./apps/authentication/recover-nfid/routes"
import { ProfileRoutes } from "./apps/identity-manager/profile/routes"
import { HomeScreen } from "./apps/marketing/landing-page"
import { Faq } from "./apps/marketing/landing-page/faq"
import { OurMission } from "./apps/marketing/landing-page/our-mission"
import IDPCoordinator from "./coordination/idp"
import PhoneCredentialCoordinator from "./coordination/phone-credential"
import RemoteIDPCoordinator from "./coordination/remote-sender"
import RequestAccountsCoordinator from "./coordination/wallet/request-accounts"
import RequestTransferCoordinator from "./coordination/wallet/request-transfer"
import { NotFound } from "./ui/pages/404"

declare const USERGEEK_API_KEY: string

if (USERGEEK_API_KEY) {
  Usergeek.init({ apiKey: USERGEEK_API_KEY as string, host: ic.host })
}

export const App = () => (
  <Routes>
    <Route path={"/"} element={<HomeScreen />} />
    <Route path={"/faq"} element={<Faq />} />
    <Route path={"/our-mission"} element={<OurMission />} />

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
          <IDPCoordinator />
        </ScreenResponsive>
      }
    />
    <Route
      path="/ridp"
      element={
        <ScreenResponsive className="flex flex-col items-center">
          <RemoteIDPCoordinator />
        </ScreenResponsive>
      }
    />

    {ProfileRoutes}
    {RecoverNFIDRoutes}

    <Route path={"*"} element={<NotFound />} />
  </Routes>
)

export default App
