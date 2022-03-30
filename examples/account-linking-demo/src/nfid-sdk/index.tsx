import { Identity } from "@dfinity/agent"
import {
  InternetIdentityProvider,
  useInternetIdentity,
} from "@identity-labs/react-ic-ii-auth"
import React from "react"

interface AccountLinkingProviderProps {
  children: ({ onClick }: { onClick: () => void }) => React.ReactElement
  onLinkIdentities: ({
    identityA,
    identityB,
  }: {
    identityA: Identity
    identityB: Identity
  }) => Promise<void>
  identityA: Identity | null
}

export const AccountLinkingProvider: React.FC<AccountLinkingProviderProps> = ({
  children,
  identityA,
  onLinkIdentities,
}) => {
  const [identityB, setIdentityB] = React.useState<Identity | null>(null)
  return (
    <InternetIdentityProvider
      authClientOptions={{
        maxTimeToLive: BigInt(Date.now() + 7 * 24 * 60 * 60 * 1e9),
        identityProvider: process.env.NEXT_PUBLIC_MP_ID_PROVIDER_URL,
        onSuccess: (identityB) => {
          console.log(">> onSuccess:", { identityB })
          setIdentityB(identityB)
        },
      }}
    >
      <AccountLinking
        identityA={identityA}
        identityB={identityB}
        onLinkIdentities={onLinkIdentities}
      >
        {children}
      </AccountLinking>
    </InternetIdentityProvider>
  )
}

interface AccountLinkingProps extends AccountLinkingProviderProps {
  identityB: Identity | null
}

const AccountLinking: React.FC<AccountLinkingProps> = ({
  children,
  identityB,
  identityA: startIdentityA,
  onLinkIdentities,
}) => {
  const { authenticate } = useInternetIdentity()
  const [waiting, setWaiting] = React.useState(false)
  const [identityA, setIdentityA] = React.useState<Identity | null>(
    startIdentityA,
  )
  console.log(">> ", { startIdentityA, identityA, identityB, waiting })

  const handleOnClick = React.useCallback(() => {
    authenticate()
    setWaiting(true)

    console.log(">> AccountLinkingProvider", { identityA, identityB })
  }, [authenticate, identityA, identityB])

  React.useEffect(() => {
    if (identityA && identityB && waiting) {
      onLinkIdentities({ identityA, identityB })
      setWaiting(false)
    }
  }, [identityA, identityB, onLinkIdentities, waiting])
  return children({ onClick: handleOnClick })
}
