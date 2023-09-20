import React from "react"
import { HelmetProvider } from "react-helmet-async"

import { AuthenticationProvider } from "./context/authentication"
import { RouteHome } from "./pages"
import { RouteAuthentication } from "./pages/authentication"
import { RouteAuthenticationGetDelegation } from "./pages/authentication-get-delegation"
import { RouteGetAccounts } from "./pages/get-accounts"
import { RouteRequestTransfer } from "./pages/request-transfer"

export function App() {
  return (
    <AuthenticationProvider>
      <HelmetProvider>
        <RouteAuthentication />
        <RouteAuthenticationGetDelegation />
        <RouteHome />
        <RouteRequestTransfer />
        <RouteGetAccounts />
      </HelmetProvider>
    </AuthenticationProvider>
  )
}

export default App
