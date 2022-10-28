import { StrictMode } from "react"
import * as ReactDOM from "react-dom/client"
import { HelmetProvider } from "react-helmet-async"

import App from "./app"

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)
root.render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)
