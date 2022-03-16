import React from "react"
import { Outlet, Route } from "react-router-dom"
import { IFrameCredentialRequesterPhonenumber } from "./phonenumber"

export const IFrameCredentialRequesterConstants = {
  base: "/request-credential-iframe",
  phonenumber: "phonenumber",
}

export const IFrameCredentialRequesterRoutes = (
  <Route path={IFrameCredentialRequesterConstants.base} element={<Outlet />}>
    <Route
      path={IFrameCredentialRequesterConstants.phonenumber}
      element={<IFrameCredentialRequesterPhonenumber />}
    />
  </Route>
)
