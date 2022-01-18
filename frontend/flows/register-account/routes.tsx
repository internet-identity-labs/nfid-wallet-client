import React from "react"
import { Outlet } from "react-router"
import { RegisterAccountIntro } from "./intro"

export const RegisterAccountConstants = {
  base: "/register-account",
  account: "", // renders Intro on /register-account,
  createNFIDProfile: "create-nfid-profile",
}

export const RegisterAccountRoutes = {
  path: RegisterAccountConstants.base,
  element: <Outlet />,
  children: [
    {
      path: RegisterAccountConstants.account,
      element: <RegisterAccountIntro />,
    },
  ],
}
