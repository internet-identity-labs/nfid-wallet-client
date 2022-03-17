import { InternetIdentityProvider } from "@identity-labs/react-ic-ii-auth"
import React from "react"

import { AuthContent } from "./AuthContent"

// Note: This is just a basic example to get you started
function Auth() {
  const [provider, setProvider] = React.useState<"II" | "NFID" | null>(null)

  return (
    <div className="auth-section">
      {!provider || provider === "II" ? (
        <InternetIdentityProvider
          authClientOptions={{
            maxTimeToLive: BigInt(Date.now() + 7 * 24 * 60 * 60 * 1e9),
            identityProvider: "https://identity.ic0.app/#authorize",
            onSuccess: (principal) => {
              setProvider("II")
            },
          }}
        >
          <div className="pt-8">
            <AuthContent reset={() => setProvider(null)} provider="II" />
          </div>
        </InternetIdentityProvider>
      ) : null}
      {!provider || provider === "NFID" ? (
        <InternetIdentityProvider
          authClientOptions={{
            maxTimeToLive: BigInt(Date.now() + 7 * 24 * 60 * 60 * 1e9),
            identityProvider: import.meta.env.VITE_NFID_PROVIDER_URL as string,
            onSuccess: (principal) => {
              setProvider("NFID")
            },
          }}
        >
          <div className="pt-8">
            <AuthContent reset={() => setProvider(null)} provider="NFID" />
          </div>
        </InternetIdentityProvider>
      ) : null}
    </div>
  )
}

export { Auth }
