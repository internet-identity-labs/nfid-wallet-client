import React from "react"
import { Outlet, Route } from "react-router-dom"
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

export const RegisterRoutes = (
  <Route path={RegisterConstants.base} element={<Outlet />}>
    <Route path={RegisterConstants.welcome} element={<RegisterWelcome />} />
    <Route
      path={RegisterConstants.createPersona}
      element={<RegisterCreatePersonaScreen />}
    />
    <Route
      path={RegisterConstants.linkInternetIdentity}
      element={
        <AuthWrapper>
          <RegisterLinkInternetIdentityScreen />
        </AuthWrapper>
      }
    />
    <Route
      path={RegisterConstants.linkInternetIdentityCreateAccount}
      element={<LinkInternetIdentityCreateAccountScreen />}
    />
    <Route
      path={RegisterConstants.linkInternetIdentitySuccess}
      element={<LinkInternetIdentitySuccessScreen />}
    />
    <Route
      path={RegisterConstants.finalizePersona}
      element={<RegisterFinalizePersonaScreen />}
    />
    <Route
      path={`${RegisterConstants.confirmation}/:secret`}
      element={
        <AuthWrapper>
          <AwaitingConfirmation />
        </AuthWrapper>
      }
    />
    <Route
      path={RegisterConstants.recoveryPhrase}
      element={<RegisterRecoveryPhraseScreen />}
    />
  </Route>
)
