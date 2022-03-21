import { InternetIdentityProvider } from "@identity-labs/react-ic-ii-auth"
import React from "react"

import { AuthButton } from "./AuthButton"
import { AuthContext } from "./AuthContext"
import { ToggleMode } from "./ToggleMode"

// Note: This is just a basic example to get you started
function Auth() {
  const [activeProvider, setActiveProvider] = React.useState<
    "II" | "NFID" | null
  >(null)
  const [isIframeMode, setIsIframeMode] = React.useState(false)
  const [isIframeOpened, setIsIframeOpened] = React.useState(false)

  const NFIDUrl = React.useMemo(() => {
    return !isIframeMode
      ? import.meta.env.VITE_NFID_PROVIDER_URL
      : import.meta.env.VITE_NFID_PROVIDER_IFRAME_URL
  }, [isIframeMode])

  return (
    <AuthContext.Provider
      value={{
        isIframeMode,
        setIsIframeMode,
        isIframeOpened,
        setIsIframeOpened,
        activeProvider,
        setActiveProvider,
      }}
    >
      <ToggleMode />
      <div className="auth-section">
        {!activeProvider || activeProvider === "II" ? (
          <InternetIdentityProvider
            authClientOptions={{
              maxTimeToLive: BigInt(Date.now() + 7 * 24 * 60 * 60 * 1e9),
              identityProvider: "https://identity.ic0.app/#authorize",
              onSuccess: (principal) => {
                setActiveProvider("II")
              },
            }}
          >
            <AuthButton provider="II" />
          </InternetIdentityProvider>
        ) : null}
        {!activeProvider || activeProvider === "NFID" ? (
          <InternetIdentityProvider
            authClientOptions={{
              maxTimeToLive: BigInt(Date.now() + 7 * 24 * 60 * 60 * 1e9),
              identityProvider: NFIDUrl as string,
              onSuccess: (principal) => {
                setActiveProvider("NFID")
              },
            }}
          >
            <AuthButton provider="NFID" />
          </InternetIdentityProvider>
        ) : null}
      </div>
    </AuthContext.Provider>
  )
}

export { Auth }
