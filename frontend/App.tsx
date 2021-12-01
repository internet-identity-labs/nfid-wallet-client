import React from "react"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
import { Authenticate } from "./flows/authenticate"
import { UnknownDeviceScreen } from "./flows/login-unknown"
import { getUserNumber } from "./ii-utils/userNumber"
import { RegisterDevicePrompt } from "./flows/register-device-promt"
import { Register } from "./flows/register"
import { RegisterConfirmation } from "./flows/register-confirmation"
import { RegisterNewDevice } from "./flows/register-new-device"
import { AuthProvider, AuthWrapper } from "./flows/auth-wrapper"
import { LinkInternetIdentity } from "./flows/link-internet-identity"
import { CopyDevices } from "./flows/copy-devices"

import { KitchenSink } from "./flows/kitchen-sink"
import { HomeScreen } from "./flows/home"
import { IFrameOverviewScreen } from "./flows/iframe-overview"
import { IdentityScreen } from "./flows/register-identity"
import { IdentityNameScreen } from "./flows/register-identity/name"
import { IdentityPhoneScreen } from "./flows/register-identity/phone"
import { IdentitySmsScreen } from "./flows/register-identity/sms"
import { IdentityChallengeScreen } from "./flows/register-identity/challenge"
import { IdentityPersonaScreen } from "./flows/register-identity/create-persona"
import { IdentityPersonaInfoScreen } from "./flows/register-identity/create-persona-info"
import { IdentityPersonaSuccessScreen } from "./flows/register-identity/create-persona-success"
import { IdentityPersonaWelcomeScreen } from "./flows/register-identity/create-persona-welcome"
import { IdentityPersonaCreatekeysScreen } from "./flows/register-identity/create-persona-createkeys"
import { IdentityPersonaCreatekeysCompleteScreen } from "./flows/register-identity/create-persona-createkeys-complete"

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
          <Route path="/copy-devices">
            <CopyDevices />
          </Route>
          <Route path="/register-identity">
            <IdentityScreen />
          </Route>
          <Route path="/register-identity-name">
            <IdentityNameScreen />
          </Route>
          <Route path="/register-identity-phone">
            <IdentityPhoneScreen />
          </Route>
          <Route path="/register-identity-sms">
            <IdentitySmsScreen />
          </Route>
          <Route path="/register-identity-challenge">
            <IdentityChallengeScreen />
          </Route>
          <Route path="/register-identity-persona-welcome">
            <IdentityPersonaWelcomeScreen />
          </Route>
          <Route path="/register-identity-persona">
            <IdentityPersonaScreen />
          </Route>
          <Route path="/register-identity-persona-info">
            <IdentityPersonaInfoScreen />
          </Route>
          <Route path="/register-identity-persona-success">
            <IdentityPersonaSuccessScreen />
          </Route>
          <Route path="/register-identity-persona-createkeys">
            <IdentityPersonaCreatekeysScreen />
          </Route>
          <Route path="/register-identity-persona-createkeys-complete">
            <IdentityPersonaCreatekeysCompleteScreen />
          </Route>

          {/* IFRAME SCREENS */}
          {/* TODO: move this decider logic into the component and make it mockable */}
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
