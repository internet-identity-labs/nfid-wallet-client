import React from "react"
import { Route } from "react-router-dom"
import { AuthorizeApp } from "./authorize"

export const IFrameAuthorizeAppConstants = {
  base: "/authorize-app-iframe",
}

export const IFrameAuthorizeAppRoutes = (
  <Route path={IFrameAuthorizeAppConstants.base} element={<AuthorizeApp />} />
)
