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
  onSuccessIdentityB: (identityB: Identity) => void
  onLinkIdentities: ({
    identityA,
    identityB,
  }: {
    identityA: Identity
    identityB: Identity
  }) => Promise<boolean>
  identityA: Identity
  loadingAccountInformation: boolean
  accountInformation: { [key: string]: string | undefined } | null
  showLinking?: boolean
}

export const AccountLinking: React.FC<AccountLinkingProviderProps> = ({
  identityA,
  showLinking,
  loadingAccountInformation,
  accountInformation,
  onLinkIdentities,
  onSuccessIdentityB,
}) => {
  const [identityB, setIdentityB] = React.useState<Identity | null>(null)
  return (
    <InternetIdentityProvider
      authClientOptions={{
        maxTimeToLive: BigInt(Date.now() + 7 * 24 * 60 * 60 * 1e9),
        onSuccess: (identityB) => {
          console.log(">> onSuccess", { identityB })
          setIdentityB(identityB)
          onSuccessIdentityB(identityB)
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
        loadingAccountInformation={loadingAccountInformation}
        showLinking={showLinking}
        identityB={identityB}
        accountInformation={accountInformation}
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
  loadingAccountInformation,
  accountInformation,
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

    console.log(">> AccountLinkingProvider", { identityA, identityB })
  }, [authenticate, identityA, identityB])

  const handleLinkIdentities = React.useCallback(async () => {
    if (!identityA || !identityB)
      throw new Error("identityA or identityB is null")

    onLinkIdentities({ identityA, identityB })
  }, [identityA, identityB, onLinkIdentities])

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
          onNewUser={() => console.log("onNewUser")}
          onLinkAccount={handleAuthenticateIdentityB}
        />
      )}
      {identityA && identityB && (
        <ExternalScreenApproveAccountToMigrate
          identityA={identityA}
          identityB={identityB}
          accountInformation={accountInformation}
          onLinkAccount={handleLinkIdentities}
        />
      )}
      <Loader isLoading={loading || loadingAccountInformation} />
    </Modal>
  )
}
