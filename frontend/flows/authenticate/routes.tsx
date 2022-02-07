import React from "react"
import { Outlet, Route } from "react-router-dom"
import { AuthenticateNFIDLogin } from "."
import { AuthWrapper } from "../auth-wrapper"
import { AuthenticateNFIDHome } from "./home"

export const AuthenticateAccountConstants = {
  base: "/auth",
  login: "login",
  home: "home",
}

export const AuthenticateAccountRoutes = (
  <Route path={AuthenticateAccountConstants.base} element={<Outlet />}>
    <Route
      path={AuthenticateAccountConstants.login}
      element={<AuthenticateNFIDLogin />}
    />
    <Route
      path={AuthenticateAccountConstants.home}
      element={
        <AuthWrapper>
          <AuthenticateNFIDHome />
        </AuthWrapper>
      }
    />
  </Route>
)
