import { HelmetProvider } from "react-helmet-async"

import { RouteHome } from "./pages"
import { RouteAuthentication } from "./pages/authentication"
import { RouteGetAccounts } from "./pages/get-accounts"
import { RoutePhoneNumberVerification } from "./pages/phone-number-credential"
import { RouteRequestTransfer } from "./pages/request-transfer"

export function App() {
  return (
    <HelmetProvider>
      <RouteAuthentication />
      <RouteHome />
      <RouteRequestTransfer />
      <RoutePhoneNumberVerification />
      <RouteGetAccounts />
    </HelmetProvider>
  )
}

export default App
