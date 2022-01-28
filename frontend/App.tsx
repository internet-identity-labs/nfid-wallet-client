import React from "react"
import { Route, Routes } from "react-router-dom"
import "tailwindcss/tailwind.css"
import { HomeScreen } from "./flows"
import { NotFound } from "./flows/404"
import { AccessPointRoutes } from "./flows/add-new-access-point/routes"
import { AuthoriseAppRoutes } from "./flows/iframes/authorize-app/routes"
import { AuthenticateRoutes } from "./flows/iframes/nfid-login/routes"
import { IFrameRoutes } from "./flows/iframes/routes"
import { CopyDevicesRoutes } from "./flows/prototypes/copy-devices/routes"
import { RegisterAccountRoutes } from "./flows/register-account/routes"
import {
  RegisterDevicePromptRoutes,
  RegisterNewDeviceRoutes
} from "./flows/register-device/routes"
import { RegisterRoutes } from "./flows/register/routes"
import { useStartUrl } from "./hooks/use-start-url"


export const App = () => {
  useStartUrl()

  return (
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
  )
}

export default App
