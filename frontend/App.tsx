import React from "react"
import { useRoutes } from "react-router-dom"
import { HomeScreen } from "./flows"
import { CopyLinkToChannel } from "./flows/add-new-access-point/copy-link-to-channel"
import { CreateKeysScreen } from "./flows/add-new-access-point/create-keys"
import { AuthProvider, AuthWrapper } from "./flows/auth-wrapper"
import { Authenticate } from "./flows/authenticate"
import { RegisterDevicePrompt } from "./flows/authorization/authorize-or-register-prompt"
import { RegisterDevicePromptSuccess } from "./flows/authorization/success"
import { REGISTER_DEVICE_PROMPT } from "./flows/constants"
import { UnknownDeviceScreen } from "./flows/iframes/login-unknown"
import { IdentityChallengeScreen } from "./flows/phone-number-verification/challenge"
import { IdentityNameScreen } from "./flows/phone-number-verification/name"
import { IdentityPhoneScreen } from "./flows/phone-number-verification/phone"
import { IdentitySmsScreen } from "./flows/phone-number-verification/sms"
import { IdentityScreen } from "./flows/phone-number-verification/start"
import { CopyDevices } from "./flows/prototypes/copy-devices"
import { Register } from "./flows/register"
import { NewFromDelegate } from "./flows/register-device/new-from-delegate"
import { AwaitingConfirmation } from "./flows/register/awaiting-confirmation"
import { RegisterCreatePersonaScreen } from "./flows/register/create-persona"
import { RegisterFinalizePersonaScreen } from "./flows/register/finalize-persona"
import { RegisterLinkInternetIdentityScreen } from "./flows/register/link-internet-identity"
import { LinkInternetIdentitySuccessScreen } from "./flows/register/link-internet-identity-success"
import { RegisterRecoveryPhraseScreen } from "./flows/register/recovery-phrase"
import { RegisterWelcome } from "./flows/register/welcome"
import { useMultipass } from "./hooks/use-multipass"
import { getUserNumber } from "./utils/internet-identity/userNumber"

function App() {
  const { persona } = useMultipass()
  const startUrl = React.useMemo(() => window.location.pathname, [])
  const userNumber = React.useMemo(
    () => getUserNumber(persona ? persona.anchor : null),
    [persona],
  )

  console.log(">App :>> ", { persona, userNumber })

  const routes = useRoutes([
    { path: "/", element: <HomeScreen /> },
    {
      path: "/new-access-point",
      children: [
        {
          path: "copy-link-to-channel",
          element: (
            <AuthWrapper>
              <CopyLinkToChannel />
            </AuthWrapper>
          ),
        },
        { path: "awaiting-confirmation", element: <AwaitingConfirmation /> },
        { path: "create-keys/:secret", element: <CreateKeysScreen /> },
      ],
    },
    {
      path: REGISTER_DEVICE_PROMPT.path,
      element: (
        <AuthWrapper>
          <RegisterDevicePrompt />
        </AuthWrapper>
      ),
    },
    {
      path: "/rdp/success",
      element: (
        <AuthWrapper>
          <RegisterDevicePromptSuccess />
        </AuthWrapper>
      ),
    },
    {
      path: "/register-confirmation/:secret",
      element: (
        <AuthWrapper>
          <AwaitingConfirmation />
        </AuthWrapper>
      ),
    },
    {
      path: "/register",
      element: <Register />,
      children: [
        { path: "create-persona", element: <RegisterCreatePersonaScreen /> },
        {
          path: "finalize-persona",
          element: <RegisterFinalizePersonaScreen />,
        },
        { path: "recovery-phrase", element: <RegisterRecoveryPhraseScreen /> },
        {
          path: "link-internet-identity",
          element: <RegisterLinkInternetIdentityScreen />,
        },
        {
          path: "link-internet-identity-success",
          element: <LinkInternetIdentitySuccessScreen />,
        },
        {
          path: "welcome",
          element: <RegisterWelcome />,
        },
      ],
    },
    { path: "/register-identity", element: <IdentityScreen /> },
    { path: "/register-identity-name", element: <IdentityNameScreen /> },
    { path: "/register-identity-phone", element: <IdentityPhoneScreen /> },
    { path: "/register-identity-sms", element: <IdentitySmsScreen /> },
    {
      path: "/register-identity-challenge",
      element: <IdentityChallengeScreen />,
    },
    { path: "/login-unknown-device", element: <UnknownDeviceScreen /> },
    {
      path: "/authenticate",
      element: userNumber ? (
        <Authenticate userNumber={userNumber} />
      ) : (
        <UnknownDeviceScreen />
      ),
    },
    { path: "/copy-devices", element: <CopyDevices /> },
    {
      path: "/register-new-device/:secret/:userNumber",
      element: <NewFromDelegate />,
    },
    //   // { path: "*", element: <NotFound /> },
  ])

  return <AuthProvider startUrl={startUrl}>{routes}</AuthProvider>
}
export default App
