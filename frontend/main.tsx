import React from "react"
import ReactDOM from "react-dom"

import { App } from "./App"

import "./main.css"
import "tailwindcss/tailwind.css"

import "swiper/css"
import "swiper/css/pagination"

import { BrowserRouter as Router } from "react-router-dom"

import SwiperCore, { Pagination } from "swiper"

SwiperCore.use([Pagination])

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
  document.getElementById("root"),
)
