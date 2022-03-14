import React from "react"
import { Route } from "react-router-dom"
import { IFrameAuthorizeApp } from "."

export const IFrameAuthorizeAppConstants = {
  base: "/authorize-app-iframe",
}

export const IFrameAuthorizeAppRoutes = (
  <Route
    path={IFrameAuthorizeAppConstants.base}
    element={<IFrameAuthorizeApp />}
  />
)
