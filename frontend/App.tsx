import React from "react"
import { useRoutes } from "react-router-dom"
import { HomeScreen } from "./flows"
import { NotFound } from "./flows/404"
import { AccessPointRoutes } from "./flows/add-new-access-point/routes"
import { AuthProvider } from "./flows/auth-wrapper"
import { AuthenticateRoutes } from "./flows/authenticate/routes"
import { IFrameRoutes } from "./flows/iframes/routes"
import { RegisterAccountRoutes } from "./flows/register-account/routes"
import { CopyDevicesRoutes } from "./flows/prototypes/copy-devices/routes"
import {
  RegisterDevicePromptRoutes,
  RegisterNewDeviceRoutes,
} from "./flows/register-device/routes"
import { RegisterRoutes } from "./flows/register/routes"

import "tailwindcss/tailwind.css"

function App() {
  const startUrl = React.useMemo(() => window.location.pathname, [])

  const routes = useRoutes([
    { path: "/", element: <HomeScreen /> },
    AccessPointRoutes,
    RegisterNewDeviceRoutes,
    RegisterDevicePromptRoutes,
    RegisterRoutes,
    RegisterAccountRoutes,
    IFrameRoutes,
    AuthenticateRoutes,
    CopyDevicesRoutes,
    { path: "*", element: <NotFound /> },
  ])

  return <AuthProvider startUrl={startUrl}>{routes}</AuthProvider>
}

export default App
