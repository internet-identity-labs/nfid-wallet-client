import React from "react"
import { Outlet, Route } from "react-router-dom"
import { IFrameAuthenticateNFIDLogin } from "./login"

export const IFrameAuthenticateAccountConstants = {
  base: "/auth-iframe",
  login: "login",
}

export const IFrameAuthenticateAccountRoutes = (
  <Route path={IFrameAuthenticateAccountConstants.base} element={<Outlet />}>
    <Route
      path={IFrameAuthenticateAccountConstants.login}
      element={<IFrameAuthenticateNFIDLogin />}
    />
  </Route>
)
