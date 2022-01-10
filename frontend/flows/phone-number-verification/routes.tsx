import React from "react"
import { Outlet } from "react-router"
import { IdentityChallengeScreen } from "./challenge"
import { IdentityNameScreen } from "./name"
import { IdentityPhoneScreen } from "./phone"
import { IdentitySmsScreen } from "./sms"
import { IdentityScreen } from "./start"

export const CONSTANTS = {
  base: "register-identity",
  identity: "", // renders IdentityScreen on /register-identity
  name: "name",
  phone: "phone",
  sms: "sms",
  challenge: "challenge",
}

export const PhoneNumberVerificationRoutes = {
  path: CONSTANTS.base,
  element: <Outlet />,
  children: [
    {
      path: CONSTANTS.identity,
      element: <IdentityScreen />,
    },
    {
      path: CONSTANTS.name,
      element: <IdentityNameScreen />,
    },
    { path: CONSTANTS.phone, element: <IdentityPhoneScreen /> },
    { path: CONSTANTS.sms, element: <IdentitySmsScreen /> },
    { path: CONSTANTS.challenge, element: <IdentityChallengeScreen /> },
  ],
}
