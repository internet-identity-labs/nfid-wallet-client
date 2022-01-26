import { useMultipass } from "frontend/hooks/use-multipass"
import { getUserNumber } from "frontend/utils/internet-identity/userNumber"
import React from "react"
import { AuthorizeApp } from "."

export const AuthoriseAppConstants = {
  base: "/authorize-app",
}

export const AuthoriseAppRoutes = {
  path: AuthoriseAppConstants.base,
  element: <AuthorizeApp />,
}
