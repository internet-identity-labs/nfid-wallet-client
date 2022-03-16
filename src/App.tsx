import React from "react"
import { Route, Routes } from "react-router-dom"
import "tailwindcss/tailwind.css"
import { Usergeek } from "usergeek-ic-js"

import { NotFound } from "./flows/404"
import { AccessPointRoutes } from "./flows/prototypes/add-new-access-point/routes"
import { CopyDevicesRoutes } from "./flows/prototypes/copy-devices/routes"
import { UnknownDeviceRoutes } from "./flows/screens-app/authenticate/login-unknown/register-decider/routes"
import { AppScreenAuthorizeAppRoutes } from "./flows/screens-app/authorize-app/routes"
import { LinkIIAnchorRoutes } from "./flows/screens-app/link-ii-anchor/routes"
import { ProfileRoutes } from "./flows/screens-app/profile/routes"
import {
  RegisterAccountConstants as RAC,
  RegisterAccountRoutes,
} from "./flows/screens-app/register-account/routes"
import { RegisterNewDeviceRoutes } from "./flows/screens-app/register-new-from-delegate/routes"
import { RestoreAccessPointRoutes } from "./flows/screens-app/restore-access-point/routes"
import { DevScreensRoutes } from "./flows/screens-dev/routes"
import { IFrameUnknownDeviceRoutes } from "./flows/screens-iframe/authenticate/login-unknown/routes"
import { IFrameAuthenticateAccountRoutes } from "./flows/screens-iframe/authenticate/routes"
import { IFrameAuthorizeAppRoutes } from "./flows/screens-iframe/authorize-app/routes"
import { IFrameProfileRoutes } from "./flows/screens-iframe/personalize/routes"
import { IFrameRestoreAccessPointRoutes } from "./flows/screens-iframe/restore-access-point/routes"

import { HomeScreen } from "./flows"

import { useStartUrl } from "./hooks/use-start-url"

import { CONFIG } from "./config"

Usergeek.init({ apiKey: CONFIG.USERGEEK_API_KEY as string })

export const App = () => {
  useStartUrl()

  return (
    <Routes>
      <Route path={"/"} element={<HomeScreen />} />
      {DevScreensRoutes}
      {AccessPointRoutes}
      {CopyDevicesRoutes}
      {LinkIIAnchorRoutes}
      {ProfileRoutes}
      {RegisterNewDeviceRoutes}
      {RegisterAccountRoutes}
      {AppScreenAuthorizeAppRoutes(`${RAC.base}/${RAC.account}`)}
      {UnknownDeviceRoutes}
      {RestoreAccessPointRoutes}

      {IFrameUnknownDeviceRoutes}
      {IFrameProfileRoutes}
      {IFrameAuthorizeAppRoutes}
      {IFrameAuthenticateAccountRoutes}
      {IFrameRestoreAccessPointRoutes}
      <Route path={"*"} element={<NotFound />} />
    </Routes>
  )
}

export default App
