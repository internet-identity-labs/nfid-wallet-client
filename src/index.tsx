import * as Sentry from "@sentry/react"
import { BrowserTracing } from "@sentry/tracing"
import React from "react"
import { createRoot } from "react-dom/client"
import { HelmetProvider } from "react-helmet-async"
import { BrowserRouter as Router } from "react-router-dom"
import SwiperCore, { Pagination, Navigation } from "swiper"
import "swiper/css"
import "swiper/css/pagination"

import { App } from "./App"
import "./index.css"

declare const SENTRY_RELEASE: string

process.env.NODE_ENV === "production" &&
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_CONNECTION,
    integrations: [new BrowserTracing()],

    // TODO: let's get some experience with it and decide later.
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0.25,
    ...(SENTRY_RELEASE ? { release: SENTRY_RELEASE } : {}),
  })

SwiperCore.use([Pagination, Navigation])

const container = document.getElementById("root")

if (!container) throw new Error("Failed to find the root element")

const root = createRoot(container)

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <Router>
        <App />
      </Router>
    </HelmetProvider>
  </React.StrictMode>,
)
