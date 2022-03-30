import React from "react"
import { AppComponent } from "next/dist/shared/lib/router/router"
import "tailwindcss/tailwind.css"

const AccountLinkingApp: AppComponent = ({ Component, pageProps }) => {
  return (
    <div className="w-screen h-screen antialiased bg-white text-slate-500">
      <Component {...pageProps} />
    </div>
  )
}

export default AccountLinkingApp
