import React from "react"
import { Outlet, Route, Routes } from "react-router-dom"
import { IdentityPersonaSuccessScreen } from "../phone-number-verification/create-persona-success"
import { RegisterCreatePersonaScreen } from "./create-persona"
import { RegisterFinalizePersonaScreen } from "./finalize-persona"
import { RegisterLinkInternetIdentityScreen } from "./link-internet-identity"
import { RegisterRecoveryPhraseScreen } from "./recovery-phrase"
import { RegisterWelcome } from "./welcome"

export const RegisterRoutes = () => {
  return (
    <Routes>
      <Route path="/register/" element={<Register />}>
        <Route path="welcome" element={<RegisterWelcome />} />
        <Route
          path="create-persona"
          element={<RegisterCreatePersonaScreen />}
        />
        <Route
          path="finalize-persona"
          element={<RegisterFinalizePersonaScreen />}
        />
        <Route
          path="recovery-phrase"
          element={<RegisterRecoveryPhraseScreen />}
        />
        <Route
          path="link-internet-identity"
          element={<RegisterLinkInternetIdentityScreen />}
        />
        <Route
          path="link-internet-identity-success"
          element={<IdentityPersonaSuccessScreen />}
        />
      </Route>
    </Routes>
  )
}

export const Register = () => {
  return <Outlet />
}
