import React from "react"
import { Outlet, Route } from "react-router-dom"
import { AuthenticateNFIDLogin } from "./login"

export const AuthenticateAccountConstants = {
  base: "/auth",
  login: "login",
}

export const AuthenticateAccountRoutes = (
  <Route path={AuthenticateAccountConstants.base} element={<Outlet />}>
    <Route
      path={AuthenticateAccountConstants.login}
      element={<AuthenticateNFIDLogin />}
    />
  </Route>
)
