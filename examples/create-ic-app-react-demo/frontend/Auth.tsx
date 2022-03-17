import { InternetIdentityProvider } from "@identity-labs/react-ic-ii-auth"
import React from "react"

import { AuthContent } from "./AuthContent"

// Note: This is just a basic example to get you started
function Auth() {
  return (
    <div className="auth-section">
      <InternetIdentityProvider
        authClientOptions={{
          maxTimeToLive: BigInt(Date.now() + 7 * 24 * 60 * 60 * 1e9),
          identityProvider: "https://identity.ic0.app/#authorize",
          onSuccess: (principal) => {
            console.log(">> onSuccess:", { principal })
          },
          onError: (e) => {
            console.error(e)
          },
        }}
      >
        <div className="pt-8">
          <AuthContent />
        </div>
      </InternetIdentityProvider>
    </div>
  )
}

export { Auth }
