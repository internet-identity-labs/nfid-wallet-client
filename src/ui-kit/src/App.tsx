import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { KitchenSink } from "./views/Home"

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<KitchenSink />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App
