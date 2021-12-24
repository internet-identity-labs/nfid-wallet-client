import React from "react"
import ReactDOM from "react-dom"

// import '@identitylabs/ui/dist/identitylabs-ui.css'
import "./index.css"
import "swiper/css"
import "swiper/css/pagination"

import App from "./App"

import SwiperCore, { Pagination } from "swiper"

SwiperCore.use([Pagination])

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root"),
)
