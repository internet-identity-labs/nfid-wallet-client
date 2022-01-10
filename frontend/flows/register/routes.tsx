import React from "react"
import { Outlet } from "react-router"
import { AuthWrapper } from "../auth-wrapper"
import { AwaitingConfirmation } from "./awaiting-confirmation"
import { RegisterCreatePersonaScreen } from "./create-persona"
import { RegisterFinalizePersonaScreen } from "./finalize-persona"
import { RegisterLinkInternetIdentityScreen } from "./link-internet-identity"
import { LinkInternetIdentityCreateAccountScreen } from "./link-internet-identity-create-account"
import { LinkInternetIdentitySuccessScreen } from "./link-internet-identity-success"
import { RegisterRecoveryPhraseScreen } from "./recovery-phrase"
import { RegisterWelcome } from "./welcome"

export const RegisterConstants = {
  base: "/register",
  welcome: "welcome",
  createPersona: "create-persona",
  linkInternetIdentity: "link-internet-identity",
  linkInternetIdentitySuccess: "link-internet-identity-success",
  linkInternetIdentityCreateAccount: "link-internet-identity-create-account",
  finalizePersona: "finalize-persona",
  recoveryPhrase: "recovery-phrase",
  confirmation: "confirmation",
}

export const RegisterRoutes = {
  path: RegisterConstants.base,
  element: <Outlet />,
  children: [
    { path: RegisterConstants.welcome, element: <RegisterWelcome /> },
    {
      path: RegisterConstants.createPersona,
      element: <RegisterCreatePersonaScreen />,
    },
    {
      path: RegisterConstants.linkInternetIdentity,
      element: (
        <AuthWrapper>
          <RegisterLinkInternetIdentityScreen />
        </AuthWrapper>
      ),
    },
    {
      path: RegisterConstants.linkInternetIdentityCreateAccount,
      element: <LinkInternetIdentityCreateAccountScreen />,
    },
    {
      path: RegisterConstants.linkInternetIdentitySuccess,
      element: <LinkInternetIdentitySuccessScreen />,
    },
    {
      path: RegisterConstants.finalizePersona,
      element: <RegisterFinalizePersonaScreen />,
    },
    {
      path: `${RegisterConstants.confirmation}/:secret`,
      element: (
        <AuthWrapper>
          <AwaitingConfirmation />
        </AuthWrapper>
      ),
    },
    {
      path: RegisterConstants.recoveryPhrase,
      element: <RegisterRecoveryPhraseScreen />,
    },
  ],
}
