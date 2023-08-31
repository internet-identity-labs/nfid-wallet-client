import { Route } from "wouter"

import { PageAuthenticationGetDelegation } from "./page"

export const RoutePathAuthenticationGetDelegation =
  "/authentication-get-delegation"

export const RouteAuthenticationGetDelegation: React.FC = () => {
  return (
    <Route path={RoutePathAuthenticationGetDelegation}>
      <PageAuthenticationGetDelegation />
    </Route>
  )
}
