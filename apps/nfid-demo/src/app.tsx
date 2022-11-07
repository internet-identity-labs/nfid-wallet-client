import { HelmetProvider } from "react-helmet-async"

import { RouteHome } from "./pages"
import { RouteGetAccounts } from "./pages/get-accounts"
import { RoutePhoneNumberVerification } from "./pages/phone-number-credential"
import { RouteRequestTransfer } from "./pages/request-transfer"

export function App() {
  return (
    <HelmetProvider>
      <RouteHome />
      <RouteRequestTransfer />
      <RoutePhoneNumberVerification />
      <RouteGetAccounts/>
    </HelmetProvider>
  )
}

export default App
