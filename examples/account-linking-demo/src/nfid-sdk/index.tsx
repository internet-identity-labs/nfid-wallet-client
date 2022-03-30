import { Identity } from "@dfinity/agent"
import { InternetIdentityProvider } from "@identity-labs/react-ic-ii-auth"
import React from "react"

interface AccountLinkingProviderProps {
  children: ({ onClick }: { onClick: () => void }) => React.ReactNode
  onLinkIdentities: ({
    identityA,
    identityB,
  }: {
    identityA: Identity
    identityB: Identity
  }) => Promise<void>
  identity: Identity | null
}

export const AccountLinkingProvider: React.FC<AccountLinkingProviderProps> = ({
  children,
}) => {
  const [identityA, setPrincipalA] = React.useState(null)
  const [identityB, setPrincipalB] = React.useState(null)

  const handleOnClick = React.useCallback(() => {
    // Persist current delegation
    // calling
  }, [])

  return (
    <InternetIdentityProvider
      authClientOptions={{
        maxTimeToLive: BigInt(Date.now() + 7 * 24 * 60 * 60 * 1e9),
        identityProvider: process.env.NEXT_PUBLIC_MP_ID_PROVIDER_URL,
        onSuccess: (principal) => {
          console.log(">> onSuccess:", { principal })
        },
      }}
    >
      {children({ onClick: handleOnClick })}
    </InternetIdentityProvider>
  )
}
