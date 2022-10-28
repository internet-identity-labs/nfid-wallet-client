import { Route } from "wouter"

export const RoutePath = "/request-transfer"

interface RouteRequestTransferProps {
  children: React.ReactNode | React.ReactNode[]
}

export const RouteRequestTransfer: React.FC<RouteRequestTransferProps> = ({
  children,
}) => {
  return <Route path={RoutePath}>{children}</Route>
}
