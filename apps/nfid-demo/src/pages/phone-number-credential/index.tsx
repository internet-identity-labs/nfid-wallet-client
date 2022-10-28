import { Route } from "wouter"

import { PagePhoneNumberVerification } from "./page"

export const RoutePathPhoneNumberVerification = "/phone-number-verification"

export const RoutePhoneNumberVerification: React.FC = () => {
  return (
    <Route path={RoutePathPhoneNumberVerification}>
      <PagePhoneNumberVerification />
    </Route>
  )
}
