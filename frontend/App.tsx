import React from "react"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { AuthProvider } from "./flows/auth-wrapper"

import { HomeScreen } from "./flows"
import { RegisterRoutes } from "./flows/register"
import { PhoneNumberVerificationRoutes } from "./flows/phone-number-verification"
import { IFrameRoutes } from "./flows/iframes"
import { ProtypeRoutes } from "./flows/prototypes"
import { RegisterDeviceRoutes } from "./flows/register-device"
import { AuthorizationRoutes } from "./flows/authorization"

function App() {
  const startUrl = React.useMemo(() => window.location.pathname, [])

  return (
    <AuthProvider startUrl={startUrl}>
      <Router>
        <Routes>
          {/* APP SCREENS */}
          <Route path="/" element={<HomeScreen />} />
        </Routes>

        <AuthorizationRoutes />
        <RegisterRoutes />
        <PhoneNumberVerificationRoutes />
        <IFrameRoutes />
        <ProtypeRoutes />
        <RegisterDeviceRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
