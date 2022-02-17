import { Button, ButtonProps } from "components/atoms/button"
import { useMultipass } from "frontend/hooks/use-multipass"
import React from "react"
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
  const { applicationName } = useMultipass()
  return (
    <Button
      as="a"
      href={`${LinkIIAnchorConstants.base}/${LinkIIAnchorConstants.linkIIAnchor}`}
      target={"_blank"}
      className="outline-none hover:underline text-blue-base active:bg-gray-200 hover:bg-gray-100"
      {...props}
    >
      Link II {applicationName} account
    </Button>
  )
}
