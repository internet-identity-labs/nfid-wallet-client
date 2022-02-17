import React from "react"
import { Usergeek } from "usergeek-ic-js"
import { Route, Routes, useParams } from "react-router-dom"
import "tailwindcss/tailwind.css"
import { HomeScreen } from "./flows"
import { NotFound } from "./flows/404"
import { AccessPointRoutes } from "./flows/prototypes/add-new-access-point/routes"
import { AuthenticateAccountRoutes } from "./flows/screens-app/authenticate/routes"
import { AuthoriseAppRoutes } from "./flows/screens-iframe/authorize-app/routes"
import { AuthenticateRoutes } from "./flows/screens-iframe/nfid-login/routes"
import { IFrameRestoreAccessPointRoutes } from "./flows/screens-iframe/restore-account/routes"
import { IFrameRoutes } from "./flows/screens-iframe/routes"
import { LinkIIAnchorRoutes } from "./flows/screens-app/link-ii-anchor/routes"
import { CopyDevicesRoutes } from "./flows/prototypes/copy-devices/routes"
import { RegisterAccountRoutes } from "./flows/screens-app/register-account/routes"
import { RegisterNewDeviceRoutes } from "./flows/screens-app/register-device/routes"
import { useStartUrl } from "./hooks/use-start-url"
import { DevScreensRoutes } from "./flows/screens-dev/routes"
import { CONFIG } from "./config"
import { RegisterAccountConstants as RAC } from "frontend/flows/screens-app/register-account/routes"
import { ProfileRoutes } from "./flows/screens-app/profile/routes"
import { RegisterDevicePromptRoutes } from "./flows/screens-app/register-device-prompt/routes"

Usergeek.init({ apiKey: CONFIG.USERGEEK_API_KEY as string })

export const App = () => {
  useStartUrl()
  const { secret, scope } = useParams()

  // TODO: find better way to handle this
  const redirectPath = `${RAC.base
    .replace(":secret", secret || ":secret")
    .replace(":scope", scope || ":scope")}/${RAC.account}`

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
      {ProfileRoutes}
      <Route path={"*"} element={<NotFound />} />
    </Routes>
  )
}

export default App
