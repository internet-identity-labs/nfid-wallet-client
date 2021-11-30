import React from "react"
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom"
import { Authenticate } from "./flows/authenticate"
import { UnknownDeviceScreen } from "./flows/login-unknown"
import { getUserNumber } from "./ii-utils/userNumber"
import { RegisterDevicePrompt } from "./flows/register-device-promt"
import { Register } from "./flows/register"
import { RegisterConfirmation } from "./flows/register-confirmation"
import { RegisterNewDevice } from "./flows/register-new-device"
import { AuthProvider, AuthWrapper } from "./flows/auth-wrapper"
import { LinkInternetIdentity } from "./flows/link-internet-identity"

import { NavigationBar } from "./ui-utils/molecules/navigation/navigation-bar"
import { NavigationHeader } from "./ui-utils/molecules/navigation/navigation-header"
import { KitchenSink } from "./flows/kitchen-sink"
import { H4 } from "./ui-utils/atoms/typography"
import { HomeScreen } from "./flows/home"
import { IFrameOverviewScreen } from "./flows/iframe-overview"

function App() {
  const userNumber = React.useMemo(() => getUserNumber(), [])

  return (
    <AuthProvider>
      <Router>
        <Switch>
          {/* APP SCREENS */}
          <Route path="/" exact>
            <HomeScreen />
          </Route>
          <Route path="/register">
            <Register />
          </Route>
          <Route path="/rdp/:secret/:scope">
            <AuthWrapper>
              <RegisterDevicePrompt />
            </AuthWrapper>
          </Route>
          <Route path="/register-confirmation/:secret">
            <AuthWrapper>
              <RegisterConfirmation />
            </AuthWrapper>
          </Route>
          <Route path="/register-new-device/:secret/:userNumber">
            <RegisterNewDevice />
          </Route>
          <Route path="/link-internet-identity">
            <LinkInternetIdentity />
          </Route>
          <Route path="/iframe-overview">
            <IFrameOverviewScreen />
          </Route>
          <Route path="/kitchen-sink">
            <KitchenSink />
          </Route>
          
          {/* IFRAME SCREENS */}
          <Route path="/login-unknown-device">
            <UnknownDeviceScreen />
          </Route>
          <Route path="/authenticate">
            {userNumber ? (
              <Authenticate userNumber={userNumber} />
            ) : (
              <UnknownDeviceScreen />
            )}
          </Route>
        </Switch>
      </Router>
    </AuthProvider>
  )
}

export default App
