import React from "react"
import { InternetIdentityProvider } from "@identity-labs/react-ic-ii-auth"

import { Navigation } from "./ui-lib/organisms/navigation"

import { MPAuthComponent } from "./components/mp-auth-component"
import { IIAuthComponent } from "./components/ii-auth-component"

function App() {
  return (
    <div className="w-full h-screen">
      <Navigation />
      <div className="p-8 pt-20 md:p-8 md:w-8/12 md:m-auto md:pt-32 lg:pt-48 2xl:max-w-7xl">
        <InternetIdentityProvider
          authClientOptions={{
            maxTimeToLive: BigInt(Date.now() + 7 * 24 * 60 * 60 * 1e9),
            identityProvider: import.meta.env
              .VITE_APP_MP_ID_PROVIDER_URL as string,
            onSuccess: (principal) => {
              console.log(">> onSuccess:", { principal })
            },
          }}
        >
          <div className="pt-8">
            <MPAuthComponent />
          </div>
        </InternetIdentityProvider>
        <InternetIdentityProvider
          authClientOptions={{
            maxTimeToLive: BigInt(Date.now() + 7 * 24 * 60 * 60 * 1e9),
            identityProvider: import.meta.env
              .VITE_APP_II_ID_PROVIDER_URL as string,
            onSuccess: (principal) => {
              console.log(">> onSuccess:", { principal })
            },
          }}
        >
          <div className="pt-8">
            <IIAuthComponent />
          </div>
        </InternetIdentityProvider>
      </div>
    </div>
  )
}

export default App
