import { createRoot } from "react-dom/client"
import { HashRouter } from "react-router-dom"
import { SWRConfig } from "swr"
import React from "react"

import { ONE_SECOND_IN_MS } from "@nfid/config"

import { App } from "./App"

const container = document.getElementById("root")

if (!container) throw new Error("Failed to find the root element")

const root = createRoot(container)

console.debug("SDK_GIT_HASH", {
  sdkGitHash: SDK_GIT_HASH,
})

root.render(
  <React.StrictMode>
    <SWRConfig
      value={{
        dedupingInterval: 5 * ONE_SECOND_IN_MS,
        focusThrottleInterval: 5 * ONE_SECOND_IN_MS,
      }}
    >
      <HashRouter>
        <App />
      </HashRouter>
    </SWRConfig>
  </React.StrictMode>,
)
