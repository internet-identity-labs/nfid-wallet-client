import React from "react"
import { Route } from "react-router-dom"
import { AuthorizeApp } from "."

export const AuthoriseAppConstants = {
  base: "/authorize-app",
}

export const AuthoriseAppRoutes = (
  <Route path={AuthoriseAppConstants.base} element={<AuthorizeApp />} />
)
