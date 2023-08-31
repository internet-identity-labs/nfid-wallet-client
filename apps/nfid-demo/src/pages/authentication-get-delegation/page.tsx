import { DerEncodedPublicKey, Signature } from "@dfinity/agent"
import {
  Delegation,
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"
import clsx from "clsx"
import { useCallback, useState } from "react"
import { ImSpinner } from "react-icons/im"

import { Button, H1 } from "@nfid-frontend/ui"
import { NFID } from "@nfid/embed"

import { useButtonState } from "../../hooks/useButtonState"
import { PageTemplate } from "../page-template"

const nfid = NFID.init({
  origin: NFID_PROVIDER_URL,
  rpcUrl: "https://node-mainnet.rarible.com",
})

export const PageAuthenticationGetDelegation = () => {
  const [authButton, updateAuthButton] = useButtonState({
    label: "Authenticate",
  })

  const [nfidResponse, setNfidResponse] = useState({})

  const handleAuthenticate = useCallback(async () => {
    updateAuthButton({ loading: true, label: "Authenticating..." })
    const isConnected = await nfid.connect()
    if (isConnected) {
      const sessionKey = Ed25519KeyIdentity.generate()

      const response = await nfid.ic?.request({
        method: "ic_getDelegation",
        params: [
          {
            sessionPublicKey: new Uint8Array(
              sessionKey.getPublicKey().toDer() as ArrayBuffer,
            ),
            maxTimeToLive: BigInt(Date.now() + 6 * 30 * 24 * 60 * 60 * 1e9),
          },
        ],
      })
      if (response) {
        const delegations = response.delegations.map((signedDelegation) => {
          return {
            delegation: new Delegation(
              signedDelegation.delegation.pubkey,
              signedDelegation.delegation.expiration,
              signedDelegation.delegation.targets,
            ),
            signature: signedDelegation.signature.buffer as Signature,
          }
        })
        const delegationChain = DelegationChain.fromDelegations(
          delegations,
          response.userPublicKey.buffer as DerEncodedPublicKey,
        )
        const identity = DelegationIdentity.fromDelegation(
          sessionKey,
          delegationChain,
        )
        updateAuthButton({
          disabled: false,
          loading: false,
          label: "Logout",
        })
        setNfidResponse({ principal: identity.getPrincipal().toText() })
      }
      console.debug("handleAuthenticate", { isConnected, response })
    }
  }, [updateAuthButton])

  const handleLogout = useCallback(async () => {
    setNfidResponse({})
    updateAuthButton({
      disabled: false,
      loading: false,
      label: "Authenticate",
    })
  }, [updateAuthButton])

  return (
    <PageTemplate title="Authentication / Registration">
      <H1 className="title">Authentication / Registration</H1>
      <div>
        by using <pre>@nfid/embed</pre>
      </div>

      {!nfid.isAuthenticated && (
        <div className="flex flex-col w-64 my-8">
          <Button
            disabled={authButton.disabled}
            onClick={
              authButton.label === "Logout" ? handleLogout : handleAuthenticate
            }
          >
            {authButton.loading ? (
              <div className={clsx("flex items-center space-x-2")}>
                <ImSpinner className={clsx("animate-spin")} />
                <div>{authButton.label}</div>
              </div>
            ) : (
              authButton.label
            )}
          </Button>
        </div>
      )}

      <div
        className={clsx(
          "w-full border border-gray-200 rounded-xl",
          "px-5 py-4 mt-8",
          "sm:px-[30px] sm:py-[26px]",
        )}
      >
        <h2 className={clsx("font-bold mb-1")}>NFID Response:</h2>
        <pre>{JSON.stringify(nfidResponse, null, 2)}</pre>
      </div>
    </PageTemplate>
  )
}
