import React from "react"
import ReactDOM from "react-dom"

import { App } from "./App"

import "./index.css"

import "swiper/css"
import "swiper/css/pagination"

import { BrowserRouter as Router } from "react-router-dom"

import SwiperCore, { Pagination, Navigation } from "swiper"

SwiperCore.use([Pagination, Navigation])

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
  document.getElementById("root"),
)
