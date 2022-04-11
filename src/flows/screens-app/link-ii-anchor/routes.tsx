import { Button, ButtonProps } from "@internet-identity-labs/nfid-sdk-react"
import { Outlet, Route } from "react-router-dom"

import { LinkIIAnchor } from "./link-ii-anchor"
import { LinkIIAnchorKeys } from "./link-ii-anchor-keys"

export const LinkIIAnchorConstants = {
  base: "/link-ii",
  linkIIAnchor: "anchor",
  keys: "keys",
}

export const LinkIIAnchorRoutes = (
  <Route path={LinkIIAnchorConstants.base} element={<Outlet />}>
    <Route
      path={LinkIIAnchorConstants.linkIIAnchor}
      element={<LinkIIAnchor />}
    />
    <Route path={LinkIIAnchorConstants.keys} element={<LinkIIAnchorKeys />} />
  </Route>
)

export const LinkIIAnchorHref = (props: ButtonProps<"a">) => {
  return (
    <Button
      text
      block
      className="block"
      as="a"
      target={"_blank"}
      href={`${LinkIIAnchorConstants.base}/${LinkIIAnchorConstants.linkIIAnchor}`}
      {...props}
    >
      Link Internet Identity anchor
    </Button>
  )
}
