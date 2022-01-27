import React from "react"
import { Route, Routes } from "react-router-dom"
import { AuthProvider } from "./flows/auth-wrapper"
import { HomeScreen } from "./flows"
import { NotFound } from "./flows/404"
import { AccessPointRoutes } from "./flows/add-new-access-point/routes"
import { AuthenticateRoutes } from "./flows/iframes/nfid-login/routes"
import { IFrameRoutes } from "./flows/iframes/routes"
import { RegisterAccountRoutes } from "./flows/register-account/routes"
import { CopyDevicesRoutes } from "./flows/prototypes/copy-devices/routes"
import {
  RegisterDevicePromptRoutes,
  RegisterNewDeviceRoutes,
} from "./flows/register-device/routes"
import { RegisterRoutes } from "./flows/register/routes"

import "tailwindcss/tailwind.css"
import { AuthoriseAppRoutes } from "./flows/iframes/authorize-app/routes"

export const App = () => {
  const startUrl = React.useMemo(() => window.location.pathname, [])
  console.log(">> App am I still rerendering all the time?", {})

  return (
    <AuthProvider startUrl={startUrl}>
      <Routes>
        <Route path={"/"} element={<HomeScreen />} />
        {RegisterNewDeviceRoutes}
        {RegisterDevicePromptRoutes}
        {RegisterRoutes}
        {RegisterAccountRoutes}
        {IFrameRoutes}
        {AuthoriseAppRoutes}
        {CopyDevicesRoutes}

        {AuthenticateRoutes}
        {AccessPointRoutes}
        <Route path={"*"} element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
