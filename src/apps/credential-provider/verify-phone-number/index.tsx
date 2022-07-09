import { Route } from "react-router-dom"

import { VerifyPhoneNumberRoute } from "./router"

export const CredentialConstants = {
  credentialVerifiedPhoneNumber: "/credential/verified-phone-number",
}

export const CredentialRoutes = (
  <Route
    path={CredentialConstants.credentialVerifiedPhoneNumber}
    element={<VerifyPhoneNumberRoute />}
  />
)
