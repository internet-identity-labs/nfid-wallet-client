import React from "react"
import ReactDOM from "react-dom"

import App from "./App"

import SwiperCore, { Pagination } from "swiper"
import { BrowserRouter as Router } from "react-router-dom"
import { AuthProvider } from "./flows/auth-wrapper"

SwiperCore.use([Pagination])

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
  document.getElementById("root"),
)
