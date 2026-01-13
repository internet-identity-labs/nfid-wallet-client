import { createRoot } from "react-dom/client"
import { BrowserRouter as Router } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { SWRConfig } from "swr"

import { ONE_SECOND_IN_MS } from "@nfid/config"
import { ToastIcons } from "@nfid/ui"

import { App } from "./App"
import { initializeConsoleWarnings, redirectFromCanisters } from "./boot"
import "./index.css"
import { Provider } from "./provider"

const container = document.getElementById("root")
initializeConsoleWarnings()
redirectFromCanisters()

if (!container) throw new Error("Failed to find the root element")

const root = createRoot(container)

console.debug("SDK_GIT_HASH", {
  sdkGitHash: SDK_GIT_HASH,
})

root.render(
  <SWRConfig
    value={{
      dedupingInterval: 5 * ONE_SECOND_IN_MS,
      focusThrottleInterval: 5 * ONE_SECOND_IN_MS,
    }}
  >
    <Provider>
      <ToastContainer icon={({ type }) => ToastIcons[type]} />
      <Router>
        <App />
      </Router>
    </Provider>
  </SWRConfig>,
)
