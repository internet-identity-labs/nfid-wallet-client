import React from "react"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { Authenticate } from "./flows/authenticate"
import { UnknownDeviceScreen } from "./flows/login-unknown"
import { RegisterDevicePrompt } from "./flows/register-device-promt"
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
import { IdentityPersonaInfoScreen } from "./flows/register/link-internet-identity/create-persona-info"
import { IdentityPersonaSuccessScreen } from "./flows/register-identity/create-persona-success"
import { IdentityPersonaWelcomeScreen } from "./flows/register-identity/create-persona-welcome"
import { IdentityPersonaCreatekeysScreen } from "./flows/register-identity/create-persona-createkeys"
import { IdentityPersonaCreatekeysCompleteScreen } from "./flows/register-identity/create-persona-createkeys-complete"
import { REGISTER_DEVICE_PROMPT } from "./flows/constants"
import { useMultipass } from "./hooks/use-multipass"
import { getUserNumber } from "./utils/internet-identity/userNumber"

function App() {
  const { account } = useMultipass()
  const userNumber = React.useMemo(
    () => getUserNumber(account ? account.rootAnchor : null),
    [account],
  )
  const startUrl = React.useMemo(() => window.location.pathname, [])

  return (
    <AuthProvider startUrl={startUrl}>
      <Router>
        <Routes>
          {/* APP SCREENS */}
          <Route path="/" element={<HomeScreen />} />

          {/*
          TITLE: Register Device Prompt
          DESCRIPTION: This screen is shown when the user has scanned a QR code on a new device.
          */}
          <Route
            path={REGISTER_DEVICE_PROMPT.path}
            element={
              <AuthWrapper>
                <RegisterDevicePrompt />
              </AuthWrapper>
            }
          />
          <Route
            path="/register-confirmation/:secret"
            element={
              <AuthWrapper>
                <RegisterConfirmation />
              </AuthWrapper>
            }
          />

          <Route
            path="/register-new-device/:secret/:userNumber"
            element={<RegisterNewDevice />}
          />

          <Route
            path="/link-internet-identity"
            element={<LinkInternetIdentity />}
          />
          <Route path="/iframe-overview" element={<IFrameOverviewScreen />} />
          <Route path="/kitchen-sink" element={<KitchenSink />} />
          <Route path="/copy-devices" element={<CopyDevices />} />

          <Route path="/register-identity" element={<IdentityScreen />} />
          <Route
            path="/register-identity-name"
            element={<IdentityNameScreen />}
          />

          <Route
            path="/register-identity-phone"
            element={<IdentityPhoneScreen />}
          />

          <Route
            path="/register-identity-sms"
            element={<IdentitySmsScreen />}
          />

          <Route
            path="/register-identity-challenge"
            element={<IdentityChallengeScreen />}
          />

          {/*
          TITLE: Register Identity Persona - Welcome Screen
          DESCRIPTION: This screen is shown when we haven't found an account in localStorage
          */}
          <Route
            path="/register-identity-persona-welcome"
            element={<IdentityPersonaWelcomeScreen />}
          />
          <Route
            path="/register-identity-persona"
            element={<IdentityPersonaScreen />}
          />
          <Route
            path="/register-identity-persona-info"
            element={<IdentityPersonaInfoScreen />}
          />
          <Route
            path="/register-identity-persona-success"
            element={<IdentityPersonaSuccessScreen />}
          />
          <Route
            path="/register-identity-persona-createkeys"
            element={<IdentityPersonaCreatekeysScreen />}
          />
          <Route
            path="/register-identity-persona-createkeys-complete"
            element={<IdentityPersonaCreatekeysCompleteScreen />}
          />

          {/* IFRAME SCREENS */}
          {/* TODO: move this decider logic into the component and make it mockable */}
          <Route
            path="/login-unknown-device"
            element={<UnknownDeviceScreen />}
          />
          <Route
            path="/authenticate"
            element={
              userNumber ? (
                <Authenticate userNumber={userNumber} />
              ) : (
                <UnknownDeviceScreen />
              )
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
