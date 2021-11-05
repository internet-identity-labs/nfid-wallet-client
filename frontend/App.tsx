import React from "react"
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom"
import { Authenticate } from "./flows/authenticate"
import { SampleFlowWithCss } from "./flows/sample-flow"
import { UnknownDeviceScreen } from "./flows/login-unknown"
import { getUserNumber } from "./ii-utils/userNumber"
import { RegisterDevicePrompt } from "./flows/register-device-promt"
import { Register } from "./flows/register"
import { RegisterConfirmation } from "./flows/register-confirmation"

function App() {
  const userNumber = React.useMemo(() => getUserNumber(), [])
  // const userNumber = BigInt(10000);
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
                  <Link to="/register">Register</Link>
                </li>
                <li>
                  <Link to="/register-confirmation">RegisterConfirmation</Link>
                </li>
                <li>
                  <Link to="/sample-flow-with-css">
                    Sample Flow with css styles
                  </Link>
                </li>
                <li>
                  <Link to="/authenticate">Authenticate</Link>
                </li>
                <li>
                  <Link to="/login-unknown-device">LoginUnknown</Link>
                </li>
              </ul>
            </nav>
          </Route>
          <Route path="/register">
            <Register />
          </Route>
          <Route path="/sample-flow-with-css">
            <SampleFlowWithCss />
          </Route>
          <Route path="/login-unknown-device">
            <UnknownDeviceScreen />
          </Route>
          <Route path="/authenticate">
            {userNumber ? (
              <Authenticate userNumber={userNumber} />
            ) : (
              <UnknownDeviceScreen />
            )}
          </Route>
          <Route path="/rdp/:secret/:scope">
            <RegisterDevicePrompt />
          </Route>
          <Route path="/register-confirmation">
            <RegisterConfirmation />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}

export default App
