import { Route } from "wouter"
import { PageGetAccounts } from "./page"


export const RoutePathGetAccounts = "/get-accounts"

export const RouteGetAccounts: React.FC = () => {
  return (
    <Route path={RoutePathGetAccounts}>
      <PageGetAccounts />
    </Route>
  )
}
