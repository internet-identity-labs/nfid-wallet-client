import React from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter as Router } from "react-router-dom"
import SwiperCore, { Pagination, Navigation } from "swiper"
import "swiper/css"
import "swiper/css/pagination"

import { App } from "./App"
import "./index.css"

SwiperCore.use([Pagination, Navigation])

const container = document.getElementById("root")

if (!container) throw new Error("Failed to find the root element")

const root = createRoot(container)

root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
)
