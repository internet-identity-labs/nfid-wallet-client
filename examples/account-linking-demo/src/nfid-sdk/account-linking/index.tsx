import { Identity } from "@dfinity/agent"
import {
  InternetIdentityProvider,
  useInternetIdentity,
} from "@identity-labs/react-ic-ii-auth"
import { Modal } from "src/ui-lib/molecules/modal"
import React from "react"
import { ExternalScreenMigrateExistingAccountDecider } from "./screen-migrate-existing-account-decider"
import { Loader } from "@identity-labs/ui"
import { ExternalScreenApproveAccountToMigrate } from "./screen-approve-account-to-migrate"

interface AccountLinkingProviderProps {
  onNewUser: () => void
  onLinkIdentities: ({
    identityA,
    identityB,
  }: {
    identityA: Identity
    identityB: Identity
  }) => Promise<boolean>
  identityA: Identity
  showLinking?: boolean
}

export const AccountLinking: React.FC<AccountLinkingProviderProps> = ({
  identityA,
  showLinking,
  onNewUser,
  onLinkIdentities,
}) => {
  const [identityB, setIdentityB] = React.useState<Identity | null>(null)
  return (
    <InternetIdentityProvider
      authClientOptions={{
        maxTimeToLive: BigInt(Date.now() + 7 * 24 * 60 * 60 * 1e9),
        onSuccess: (identityB) => {
          console.log(">> onSuccess", { identityB })
          setIdentityB(identityB)
        },
        opener: () =>
          window.open(
            "https://identity.ic0.app/#authorize".toString(),
            "idpWindow",
            `toolbar=0,location=0,menubar=0, width=400, height=600, left=${
              window.screen.width / 2 - 200
            }, top=${window.screen.height / 2 - 300}`,
          ),
      }}
    >
      <AccountLinkingContent
        identityA={identityA}
        showLinking={showLinking}
        identityB={identityB}
        onNewUser={onNewUser}
        onLinkIdentities={onLinkIdentities}
      />
    </InternetIdentityProvider>
  )
}

interface AccountLinkingProps
  extends Omit<AccountLinkingProviderProps, "onSuccessIdentityB"> {
  identityB: Identity | null
}

const AccountLinkingContent: React.FC<AccountLinkingProps> = ({
  identityA,
  identityB,
  showLinking,
  onNewUser,
  onLinkIdentities,
}) => {
  const { isAuthenticated, authenticate } = useInternetIdentity()
  const [loading, setLoading] = React.useState(false)
  console.log(">> ", {
    identityA: identityA?.getPrincipal().toString(),
    identityB: identityB?.getPrincipal().toString(),
    loading,
  })

  const handleAuthenticateIdentityB = React.useCallback(() => {
    authenticate()
    setLoading(true)
  }, [authenticate])

  React.useEffect(() => {
    if (identityA && identityB && loading) {
      onLinkIdentities({ identityA, identityB })
      setLoading(false)
    }
  }, [identityA, identityB, onLinkIdentities, loading])

  React.useEffect(() => {
    if (loading && identityB) {
      setLoading(false)
    }
  }, [loading, identityB])

  return (
    <Modal
      isVisible={isAuthenticated && showLinking}
      id="account-linking"
      onClose={() => console.log("onClose")}
    >
      {!identityB && (
        <ExternalScreenMigrateExistingAccountDecider
          onNewUser={onNewUser}
          onLinkAccount={handleAuthenticateIdentityB}
        />
      )}
      <Loader isLoading={loading} />
    </Modal>
  )
}
