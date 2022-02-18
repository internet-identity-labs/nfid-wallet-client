import React from "react"
import { Outlet, Route } from "react-router-dom"
import { AuthenticateNFIDLogin } from "."
import { NFIDPersonalize } from "./personalize"

export const AuthenticateAccountConstants = {
  base: "/auth",
  login: "login",
  personalize: "personalize",
}

export const AuthenticateAccountRoutes = (
  <Route path={AuthenticateAccountConstants.base} element={<Outlet />}>
    <Route
      path={AuthenticateAccountConstants.login}
      element={<AuthenticateNFIDLogin />}
    />
    <Route
      path={AuthenticateAccountConstants.personalize}
      element={<NFIDPersonalize />}
    />
  </Route>
)
