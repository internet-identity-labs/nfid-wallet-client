import React from "react"
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom"
import { Authenticate } from "./flows/authenticate"
import { SampleFlowWithCss } from "./flows/sample-flow"
import { UnknownDeviceScreen } from "./flows/login-unknown"
import { getUserNumber } from "./ii-utils/userNumber"
import { RegisterDevicePrompt } from "./flows/register-device-promt"
import { Register } from "./flows/register"
import { RegisterConfirmation } from "./flows/register-confirmation"
import { RegisterNewDevice } from "./flows/register-new-device"
import { AuthProvider, AuthWrapper } from "./flows/auth-wrapper"
import { LinkInternetIdentity } from "./flows/link-internet-identity"
import { CopyDevices } from "./flows/copy-devices"

function App() {
  const userNumber = React.useMemo(() => getUserNumber(), [])
  return (
    <AuthProvider>
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
                    <Link to="/register-confirmation">
                      RegisterConfirmation
                    </Link>
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
                  <li>
                    <Link to="/link-internet-identity">
                      LinkInternetIdentity
                    </Link>
                  </li>
                  <li>
                    <Link to="/copy-devices">CopyDevices</Link>
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
            {/* IFRAME SCREENS */}
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
            {/* MOBILE DEVICE SCREENS */}
            <Route path="/rdp/:secret/:scope">
              <AuthWrapper>
                <RegisterDevicePrompt />
              </AuthWrapper>
            </Route>
            <Route path="/register-confirmation/:secret">
              <AuthWrapper>
                <RegisterConfirmation />
              </AuthWrapper>
            </Route>
            <Route path="/register-new-device/:secret/:userNumber">
              <RegisterNewDevice />
            </Route>
            <Route path="/link-internet-identity">
              <LinkInternetIdentity />
            </Route>
            <Route path="/copy-devices">
              <CopyDevices />
            </Route>
          </Switch>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
