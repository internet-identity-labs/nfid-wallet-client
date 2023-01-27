import { Route } from "wouter"

import { PageAuthenticationIframe } from "./page"

export const RoutePathAuthenticationIFrame = "/authentication-iframe"

export const RouteAuthenticationIFrame: React.FC = () => {
  return (
    <Route path={RoutePathAuthenticationIFrame}>
      <PageAuthenticationIframe />
    </Route>
  )
}
