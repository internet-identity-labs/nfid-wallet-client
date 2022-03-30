import { Identity } from "@dfinity/agent"
import {
  InternetIdentityProvider,
  useInternetIdentity,
} from "@identity-labs/react-ic-ii-auth"
import { Button } from "@identity-labs/ui"
import React from "react"
import { createProfileActor } from "src/ic-utils/profile"
import { AccountLinking } from "src/nfid-sdk/account-linking"
import { useAccountLinkingStepper } from "src/use-account-linking-stepper"

interface RegisterNFIDAccountProps {
  onUseProvider: (principal: Identity) => void
}

export const RegisterNFIDAccount: React.FC<RegisterNFIDAccountProps> = ({
  onUseProvider,
}) => {
  return (
    <InternetIdentityProvider
      authClientOptions={{
        maxTimeToLive: BigInt(Date.now() + 7 * 24 * 60 * 60 * 1e9),
        identityProvider:
          "https://3y5ko-7qaaa-aaaal-aaaaq-cai.ic0.app/authenticate/?applicationName=NFID-Demo",
        onSuccess: (principal) => {
          onUseProvider(principal)
        },
        opener: () =>
          window.open(
            "https://3y5ko-7qaaa-aaaal-aaaaq-cai.ic0.app/authenticate/?applicationName=NFID-Demo",
            "idpWindow",
            `toolbar=0,location=0,menubar=0, width=400, height=600, left=${
              window.screen.width / 2 - 200
            }, top=${window.screen.height / 2 - 300}`,
          ),
      }}
    >
      <RegiserNFIDAccountContent />
    </InternetIdentityProvider>
  )
}

const RegiserNFIDAccountContent: React.FC = () => {
  const fetchRef = React.useRef<{ readAccount?: boolean }>({})
  const { isAuthenticated, identity, authenticate, signout } =
    useInternetIdentity()
  const { state, setNFIDUserName } = useAccountLinkingStepper()
  const [showLinking, setShowLinking] = React.useState(false)

  const handleReadAccount = React.useCallback(async () => {
    fetchRef.current = {
      readAccount: true,
    }
    const { readAccount } = createProfileActor({
      identity: identity ?? undefined,
    })
    const respone = await readAccount()
    if ("data" in respone) {
      console.log(">> RegiserNFIDAccountContent handleReadAccount", {
        user: respone.data,
      })
      setShowLinking(false)
      return setNFIDUserName(respone.data.userName)
    }
    console.log(">> RegiserNFIDAccountContent handleReadAccount", {
      err: respone.err,
    })
    setShowLinking(true)
  }, [identity, setNFIDUserName])

  React.useEffect(() => {
    if (isAuthenticated && !fetchRef.current.readAccount) {
      handleReadAccount()
    }
  }, [handleReadAccount, isAuthenticated])

  const handleLinkIdentities = React.useCallback(
    async ({
      identityA,
      identityB,
    }: {
      identityA: Identity
      identityB: Identity
    }) => {
      console.log(">> handleLinkIdentities", {
        identityA: identityA.getPrincipal().toText(),
        identityB: identityB.getPrincipal().toText(),
      })
      const { linkAuthenticator } = createProfileActor({
        identity: identityB,
      })
      const response = await linkAuthenticator(
        identityA.getPrincipal().toText(),
      )
      if ("data" in response) {
        console.log(">> handleLinkIdentities", {
          message: response.data,
        })
        return true
      }
      console.error(">> handleLinkIdentities", { error: response.err })
      return false
    },
    [],
  )

  return (
    <div className="py-4 mx-4">
      <div>3. Register your NFID Account</div>
      {!isAuthenticated ? (
        <Button onClick={authenticate}>Log in NFID</Button>
      ) : !state.nfid.userName && identity ? (
        <AccountLinking
          showLinking={showLinking}
          identityA={identity}
          onLinkIdentities={handleLinkIdentities}
          onNewUser={() => setShowLinking(false)}
        />
      ) : (
        <div>Linked Account userName: {state.nfid.userName}</div>
      )}
      {isAuthenticated && (
        <div className="flex">
          <Button
            onClick={async () => {
              if (identity) {
                console.log(">> readAccount", {
                  principalId: identity.getPrincipal().toString(),
                })
                const { readAccount } = createProfileActor({
                  identity: identity ?? undefined,
                })
                const response = await readAccount()
                console.log(">> readAccount", { response })
              }
            }}
          >
            readAccount
          </Button>
          <Button onClick={signout}>Log out NFID</Button>
        </div>
      )}
    </div>
  )
}
