import React from "react"
import { Outlet } from "react-router"
import { AuthWrapper } from "../auth-wrapper"
import { AwaitingConfirmation } from "./awaiting-confirmation"
import { RegisterCreatePersonaScreen } from "./create-persona"
import { RegisterFinalizePersonaScreen } from "./finalize-persona"
import { RegisterLinkInternetIdentityScreen } from "./link-internet-identity"
import { LinkInternetIdentitySuccessScreen } from "./link-internet-identity-success"
import { RegisterRecoveryPhraseScreen } from "./recovery-phrase"
import { RegisterWelcome } from "./welcome"

export const CONSTANTS = {
  base: "register",
  welcome: "welcome",
  createPersona: "create-persona",
  linkInternetIdentity: "link-internet-identity",
  linkInternetIdentitySuccess: "link-internet-identity-success",
  finalizePersona: "finalize-persona",
  recoveryPhrase: "recovery-phrase",
  confirmation: "confirmation",
}

export const RegisterRoutes = {
  path: CONSTANTS.base,
  element: <Outlet />,
  children: [
    { path: CONSTANTS.welcome, element: <RegisterWelcome /> },
    { path: CONSTANTS.createPersona, element: <RegisterCreatePersonaScreen /> },
    {
      path: CONSTANTS.linkInternetIdentity,
      element: (
        <AuthWrapper>
          <RegisterLinkInternetIdentityScreen />
        </AuthWrapper>
      ),
    },
    {
      path: CONSTANTS.linkInternetIdentitySuccess,
      element: <LinkInternetIdentitySuccessScreen />,
    },
    {
      path: CONSTANTS.finalizePersona,
      element: <RegisterFinalizePersonaScreen />,
    },
    {
      path: `${CONSTANTS.confirmation}/:secret`,
      element: (
        <AuthWrapper>
          <AwaitingConfirmation />
        </AuthWrapper>
      ),
    },
    {
      path: CONSTANTS.recoveryPhrase,
      element: <RegisterRecoveryPhraseScreen />,
    },
  ],
}
