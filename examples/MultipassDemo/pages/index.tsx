import React from "react"
import { InternetIdentityProvider } from "@identity-labs/react-ic-ii-auth"

import { Navigation } from "src/ui-lib/organisms/navigation"

import { MPAuthComponent } from "src/components/mp-auth-component"
import { IIAuthComponent } from "src/components/ii-auth-component"

function App() {
  return (
    <div className="h-screen w-full bg-gradient-to-br from-blue-500 to-yellow-500">
      <Navigation />
      <div className="p-8 pt-20 md:p-8 md:w-8/12 md:m-auto md:pt-32 lg:pt-48 2xl:max-w-7xl">
        <InternetIdentityProvider
          authClientOptions={{
            maxTimeToLive: BigInt(Date.now() + 7 * 24 * 60 * 60 * 1e9),
            identityProvider: process.env.NEXT_PUBLIC_II_CANISTER_URL,
            onSuccess: (principal) => {
              console.log(">> onSuccess", { principal })
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
            // TODO: pull from env PLEASE!
            // identityProvider: `http://qjdve-lqaaa-aaaaa-aaaeq-cai.localhost:8000/#authorize`,
            identityProvider: "https://identity.ic0.app/#authorize",
            onSuccess: (principal) => {
              console.log(">> onSuccess", { principal })
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
