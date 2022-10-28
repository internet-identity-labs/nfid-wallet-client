import { Route } from "wouter"

import { PageRequestTransfer } from "./page"

export const RoutePath = "/request-transfer"

export const RouteRequestTransfer: React.FC = () => {
  return (
    <Route path={RoutePath}>
      <PageRequestTransfer />
    </Route>
  )
}
