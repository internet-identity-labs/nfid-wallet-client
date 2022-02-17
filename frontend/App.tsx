import React from "react"
import { Usergeek } from "usergeek-ic-js"
import { Route, Routes, useParams } from "react-router-dom"
import "tailwindcss/tailwind.css"
import { HomeScreen } from "./flows"
import { NotFound } from "./flows/404"
import { AccessPointRoutes } from "./flows/add-new-access-point/routes"
import { AuthenticateAccountRoutes } from "./flows/authenticate/routes"
import { AuthoriseAppRoutes } from "./flows/iframes/authorize-app/routes"
import { AuthenticateRoutes } from "./flows/iframes/nfid-login/routes"
import { IFrameRestoreAccessPointRoutes } from "./flows/iframes/restore-account/routes"
import { IFrameRoutes } from "./flows/iframes/routes"
import { LinkIIAnchorRoutes } from "./flows/app-screens/link-ii-anchor/routes"
import { CopyDevicesRoutes } from "./flows/prototypes/copy-devices/routes"
import { RegisterAccountRoutes } from "./flows/register-account/routes"
import {
  RegisterDevicePromptRoutes,
  RegisterNewDeviceRoutes,
} from "./flows/register-device/routes"
import { useStartUrl } from "./hooks/use-start-url"
import { DevScreensRoutes } from "./flows/dev-screens/routes"
import { CONFIG } from "./config"
import { RegisterAccountConstants as RAC } from "frontend/flows/register-account/routes"

Usergeek.init({ apiKey: CONFIG.USERGEEK_API_KEY as string })

export const App = () => {
  useStartUrl()
  const { secret, scope } = useParams()

  const redirectPath = `${RAC.base}/${secret}/${scope}/${RAC.account}`
  return (
    <Routes>
      <Route path={"/"} element={<HomeScreen />} />
      {DevScreensRoutes}
      {RegisterNewDeviceRoutes}
      {RegisterDevicePromptRoutes(redirectPath)}
      {RegisterAccountRoutes}
      {IFrameRoutes}
      {IFrameRestoreAccessPointRoutes}
      {AuthoriseAppRoutes}
      {LinkIIAnchorRoutes}
      {CopyDevicesRoutes}
      {AuthenticateRoutes}
      {AccessPointRoutes}
      {AuthenticateAccountRoutes}
      <Route path={"*"} element={<NotFound />} />
    </Routes>
  )
}

export default App
