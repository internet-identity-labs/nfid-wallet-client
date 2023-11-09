import React from "react"
import { HelmetProvider } from "react-helmet-async"

import { AuthenticationProvider } from "./context/authentication"
import { RouteHome } from "./pages"

export function App() {
  console.debug("App")
  return (
    <AuthenticationProvider>
      <HelmetProvider>
        <RouteHome />
      </HelmetProvider>
    </AuthenticationProvider>
  )
}

export default App
