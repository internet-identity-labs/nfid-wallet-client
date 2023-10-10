import { HttpAgent } from "@dfinity/agent"
import { AuthClient } from "@dfinity/auth-client"
import { DelegationIdentity } from "@dfinity/identity"
import React from "react"
import useSWR from "swr"

import { useAuthenticationContext } from "../context/authentication"
import { useButtonState } from "./useButtonState"

declare const CANISTER_IDS: { [key: string]: { [key: string]: string } }
declare const NFID_PROVIDER_URL: string

export const useAuthentication = () => {
  const { nfid, identity, setIdentity } = useAuthenticationContext()
  const { data: authClient } = useSWR("authClient", () => AuthClient.create())
  const [error, setError] = React.useState<string>()

  const [authButton, updateAuthButton] = useButtonState({
    label: "Authenticate",
  })

  const derivationOrigin = React.useMemo(() => {
    const origin = window.location.origin
    const isDevDerivationOrigin = origin.includes("-dev.nfid.one")
    const isProdDerivationOrigin = origin.includes(".nfid.one")
    const derivationCanisterId = isDevDerivationOrigin
      ? CANISTER_IDS["nfid-demo"].dev
      : isProdDerivationOrigin
      ? CANISTER_IDS["nfid-demo"].ic
      : undefined

    return derivationCanisterId && `https://${derivationCanisterId}.ic0.app`
  }, [])

  React.useEffect(() => {
    if (nfid?.isAuthenticated) {
      const identity = nfid.getIdentity()
      updateAuthButton({ label: "Logout" })
      setIdentity(identity as unknown as DelegationIdentity)
    }
  }, [nfid, setIdentity, updateAuthButton])

  const handleLegacyAuthenticate = React.useCallback(async () => {
    if (!authClient) return

    updateAuthButton({ loading: true, label: "Authenticating..." })
    await authClient.login({
      onSuccess: () => {
        const identity = authClient.getIdentity() as DelegationIdentity
        if (!(window as any).ic) (window as any).ic = {}
        ;(window as any).ic.agent = new HttpAgent({
          identity,
          host: "https://ic0.app",
        })
        updateAuthButton({
          disabled: false,
          loading: false,
          label: "Logout",
        })
        setIdentity(identity)
      },
      onError: (error: any) => {
        console.error(error)
      },
      identityProvider: `${NFID_PROVIDER_URL}/authenticate?applicationName=NFID-DEMO&applicationLogo=https://logo.clearbit.com/clearbit.com`,
      windowOpenerFeatures: `toolbar=0,location=0,menubar=0,width=525,height=705`,
    })
  }, [authClient, setIdentity, updateAuthButton])
  const handleAuthenticate = React.useCallback(
    async ({
      targets,
      maxTimeToLive,
    }: {
      targets: string[]
      maxTimeToLive: bigint
    }) => {
      setError(undefined)
      if (!nfid) throw new Error("NFID not initialized")

      console.debug("handleAuthenticate", { targets })
      updateAuthButton({ loading: true, label: "Authenticating..." })
      try {
        const identity = await nfid.getDelegation({
          maxTimeToLive,
          ...(targets.length ? { targets } : {}),
          ...(derivationOrigin ? { derivationOrigin } : {}),
        })
        setIdentity(identity as unknown as DelegationIdentity)
        updateAuthButton({ loading: false, label: "Logout" })
        return identity
      } catch (error: any) {
        console.debug("handleAuthenticate", { error })
        updateAuthButton({ loading: false, label: "Authenticate" })
        setError(error)
        return
      }
    },
    [derivationOrigin, nfid, setIdentity, updateAuthButton],
  )

  return {
    identity,
    setIdentity,
    error,
    setError,
    nfid,
    authButton,
    updateAuthButton,
    handleAuthenticate,
    handleLegacyAuthenticate,
  }
}
