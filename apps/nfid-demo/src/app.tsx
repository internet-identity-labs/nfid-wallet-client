import { HelmetProvider } from "react-helmet-async"

import { RouteHome } from "./pages"
import { RoutePhoneNumberVerification } from "./pages/phone-number-credential"
import { RouteRequestTransfer } from "./pages/request-transfer"

export function App() {
  return (
    <HelmetProvider>
      <RouteHome />
      <RouteRequestTransfer />
      <RoutePhoneNumberVerification />
    </HelmetProvider>
  )
}

export default App
