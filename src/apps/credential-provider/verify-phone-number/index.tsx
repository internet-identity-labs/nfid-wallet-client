import { Route } from "react-router-dom"
import PhoneCredentialFlow from '../phone-number'

export const CredentialConstants = {
  credentialVerifiedPhoneNumber: "/credential/verified-phone-number",
}

export const CredentialRoutes = (
  <Route
    path={CredentialConstants.credentialVerifiedPhoneNumber}
    element={<PhoneCredentialFlow />}
  />
)
