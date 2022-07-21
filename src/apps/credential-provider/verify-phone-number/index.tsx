import { Route } from "react-router-dom"

import PhoneCredentialCoordinator from "frontend/coordination/phone-credential"

export const CredentialConstants = {
  credentialVerifiedPhoneNumber: "/credential/verified-phone-number",
}

export const CredentialRoutes = (
  <Route
    path={CredentialConstants.credentialVerifiedPhoneNumber}
    element={<PhoneCredentialCoordinator />}
  />
)
