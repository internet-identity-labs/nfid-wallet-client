import React from "react"
import { AuthorizeApp } from "."

export const AuthoriseAppConstants = {
  base: "/authorize-app",
}

export const AuthoriseAppRoutes = {
  path: AuthoriseAppConstants.base,
  element: <AuthorizeApp />,
}
