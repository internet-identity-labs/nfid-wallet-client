import { HelmetProvider } from "react-helmet-async"

import { RouteHome } from "./pages"
import { RouteAuthentication } from "./pages/authentication"
import { RouteAuthenticationGetDelegation } from "./pages/authentication-get-delegation"
import { RouteAuthenticationIFrame } from "./pages/authentication-iframe"
import { RouteGetAccounts } from "./pages/get-accounts"
import { RouteRequestTransfer } from "./pages/request-transfer"

export function App() {
  return (
    <HelmetProvider>
      <RouteAuthentication />
      <RouteAuthenticationGetDelegation />
      <RouteAuthenticationIFrame />
      <RouteHome />
      <RouteRequestTransfer />
      <RouteGetAccounts />
    </HelmetProvider>
  )
}

export default App
