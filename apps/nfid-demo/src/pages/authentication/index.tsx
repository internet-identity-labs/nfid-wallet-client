import { Route } from "wouter"

import { PageAuthentication } from "./page"

export const RoutePathAuthentication = "/authentication"

export const RouteAuthentication: React.FC = () => {
  return (
    <Route path={RoutePathAuthentication}>
      <PageAuthentication />
    </Route>
  )
}
