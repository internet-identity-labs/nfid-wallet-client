import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter as Router } from "react-router-dom"
import SwiperCore, { Pagination, Navigation } from "swiper"
import "swiper/css"
import "swiper/css/pagination"

import { App } from "./App"
import "./index.css"

SwiperCore.use([Pagination, Navigation])

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
  document.getElementById("root"),
)
