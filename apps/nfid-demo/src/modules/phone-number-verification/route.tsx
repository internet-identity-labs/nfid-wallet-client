import { Route } from "wouter"

export const RoutePath = "/phone-number-verification"

interface ConfigurationRouteProps {
  children: React.ReactNode | React.ReactNode[]
}

export const RoutePhoneNumberVerification: React.FC<
  ConfigurationRouteProps
> = ({ children }) => {
  return <Route path={RoutePath}>{children}</Route>
}
