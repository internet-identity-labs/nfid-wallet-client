import React from "react"
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import { Authenticate } from "./flows/authenticate";
import { SampleFlowWithCss } from "./flows/sample-flow";
// import { IIConnection } from "./ii-utils/iiConnection";

function App() {

  return (
    <Router>
      <div className="h-screen w-screen relative">
        <Switch>
          <Route path="/" exact>
            <nav>
              <ul>
                <li>
                  <Link to="/">Screen Overview</Link>
                </li>
                <li>
                  <Link to="/sample-flow-with-css">Sample Flow with css styles</Link>
                </li>
                <li>
                  <Link to="/authenticate">Authenticate</Link>
                </li>
              </ul>
            </nav>
          </Route>
          <Route path="/sample-flow-with-css">
            <SampleFlowWithCss />
          </Route>
          <Route path="/authenticate">
            <Authenticate />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}

export default App
