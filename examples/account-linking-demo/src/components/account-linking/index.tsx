import React from "react"
import { AccountLinkingProvider } from "src/nfid-sdk"
import { useInternetIdentity } from "@identity-labs/react-ic-ii-auth"
import { Modal } from "src/ui-lib/molecules/modal"
import { ExternalScreenMigrateExistingAccountDecider } from "./screen"
import { Identity } from "@dfinity/agent"

interface AccountLinkingProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const AccountLinking: React.FC<AccountLinkingProps> = ({
  children,
  className,
}) => {
  const { identity, isAuthenticated } = useInternetIdentity()
  const [accountRequested, setAccountRequested] = React.useState(false)
  const [showLinking, setShowLinking] = React.useState(false)
  const [accountLinked, setAccountLinked] = React.useState(false)

  console.log(">> ", { accountRequested, showLinking, identity })

  const handleGetAccount = React.useCallback(async () => {
    console.log(">> request account with", { identity })

    setShowLinking(true)
  }, [identity])

  const handleLinkIdentities = React.useCallback(
    async ({
      identityA,
      identityB,
    }: {
      identityA: Identity
      identityB: Identity
    }) => {
      // TODO: Bootstrap your linking actors and call with the identities
      console.log(">> handleLinkIdentities", {
        identityA: identityA.getPrincipal().toText(),
        identityB: identityB.getPrincipal().toText(),
      })

      setShowLinking(false)
      setAccountLinked(true)
    },
    [],
  )

  React.useEffect(() => {
    if (isAuthenticated && !accountRequested) {
      handleGetAccount()
      setAccountRequested(true)
    }
  }, [accountRequested, handleGetAccount, isAuthenticated])

  return isAuthenticated ? (
    showLinking ? (
      <AccountLinkingProvider
        identityA={identity}
        onLinkIdentities={handleLinkIdentities}
      >
        {({ onClick }) => (
          <Modal
            isVisible={isAuthenticated && showLinking}
            id="account-linking"
            onClose={() => setShowLinking(false)}
          >
            <ExternalScreenMigrateExistingAccountDecider
              onNewUser={() => setShowLinking(false)}
              onLinkAccount={onClick}
            />
          </Modal>
        )}
      </AccountLinkingProvider>
    ) : accountLinked ? (
      <div>Success! You have linked your Account</div>
    ) : (
      <div onClick={() => setShowLinking(true)}>yes, link account</div>
    )
  ) : null
}
