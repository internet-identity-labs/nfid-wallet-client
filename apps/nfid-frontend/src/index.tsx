import * as Sentry from "@sentry/react"
import { BrowserTracing } from "@sentry/tracing"
import { createRoot } from "react-dom/client"
import { BrowserRouter as Router } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { SWRConfig } from "swr"

import { ONE_SECOND_IN_MS } from "@nfid/config"

import { App } from "./App"
import { initializeConsoleWarnings, redirectFromCanisters } from "./boot"
import "./index.css"
import { Provider } from "./provider"
import { ToastIcons } from "./ui/atoms/toast-icons"

process.env.NODE_ENV === "production" &&
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_CONNECTION,
    integrations: [new BrowserTracing()],
    normalizeDepth: 10,

    // TODO: let's get some experience with it and decide later.
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0.25,
    ...(SENTRY_RELEASE ? { release: SENTRY_RELEASE } : {}),
  })

const container = document.getElementById("root")
initializeConsoleWarnings()
redirectFromCanisters()

if (!container) throw new Error("Failed to find the root element")

const root = createRoot(container)

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
