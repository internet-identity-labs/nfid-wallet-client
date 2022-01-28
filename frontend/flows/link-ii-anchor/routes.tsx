import React from "react"
import { Outlet } from "react-router"
import { LinkIIAnchor } from "./link-ii-anchor"
import { LinkIIAnchorKeys } from "./link-ii-anchor-keys"

export const LinkIIAnchorConstants = {
  base: "/link-ii-anchor",
  linkIIAnchor: "", // renders LinkIIAnchor on /link-ii-anchor,
  keys: "keys",
}

export const LinkIIAnchorRoutes = {
  path: LinkIIAnchorConstants.base,
  element: <Outlet />,
  children: [
    {
      path: LinkIIAnchorConstants.linkIIAnchor,
      element: <LinkIIAnchor />,
    },
    {
      path: LinkIIAnchorConstants.keys,
      element: <LinkIIAnchorKeys />,
    },
  ],
}
