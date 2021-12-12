import React from "react"
import { Route, Routes } from "react-router-dom"
import { IdentityChallengeScreen } from "./challenge"
import { IdentityNameScreen } from "./name"
import { IdentityPhoneScreen } from "./phone"
import { IdentitySmsScreen } from "./sms"
import { IdentityScreen } from "./start"

export const PhoneNumberVerificationRoutes = () => (
  <Routes>
    <Route path="/register-identity" element={<IdentityScreen />} />
    <Route path="/register-identity-name" element={<IdentityNameScreen />} />

    <Route path="/register-identity-phone" element={<IdentityPhoneScreen />} />

    <Route path="/register-identity-sms" element={<IdentitySmsScreen />} />

    <Route
      path="/register-identity-challenge"
      element={<IdentityChallengeScreen />}
    />
  </Routes>
)
