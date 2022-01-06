import React from "react"
import { Outlet } from "react-router"
import { IdentityChallengeScreen } from "./challenge"
import { IdentityNameScreen } from "./name"
import { IdentityPhoneScreen } from "./phone"
import { IdentitySmsScreen } from "./sms"
import { IdentityScreen } from "./start"

export const PhoneNumberVerificationConstants = {
  base: "register-identity",
  identity: "", // renders IdentityScreen on /register-identity
  name: "name",
  phone: "phone",
  sms: "sms",
  challenge: "challenge",
}

export const PhoneNumberVerificationRoutes = {
  path: PhoneNumberVerificationConstants.base,
  element: <Outlet />,
  children: [
    {
      path: PhoneNumberVerificationConstants.identity,
      element: <IdentityScreen />,
    },
    {
      path: PhoneNumberVerificationConstants.name,
      element: <IdentityNameScreen />,
    },
    { path: PhoneNumberVerificationConstants.phone, element: <IdentityPhoneScreen /> },
    { path: PhoneNumberVerificationConstants.sms, element: <IdentitySmsScreen /> },
    { path: PhoneNumberVerificationConstants.challenge, element: <IdentityChallengeScreen /> },
  ],
}
