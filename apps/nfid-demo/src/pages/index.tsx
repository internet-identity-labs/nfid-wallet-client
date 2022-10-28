import { Route } from "wouter"

import { PageTemplate } from "./page-template"

export const RoutePathHome = "/"

export const RouteHome: React.FC = () => {
  return (
    <Route path={RoutePathHome}>
      <PageTemplate title="Home">
        <div>Home</div>
      </PageTemplate>
    </Route>
  )
}
