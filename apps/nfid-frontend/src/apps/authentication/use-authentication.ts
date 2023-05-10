import { DelegationChain, Ed25519KeyIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import * as Sentry from "@sentry/browser"
import { atom, useAtom } from "jotai"
import React from "react"
import { Usergeek } from "usergeek-ic-js"

import {
  authState,
  hasOwnProperty,
  isDelegationExpired,
} from "@nfid/integration"
import { agent } from "@nfid/integration"

import { userNumberAtom } from "frontend/integration/identity-manager/account/state"
import {
  fetchRecoveryDevices,
  fromSeedPhrase,
  login as iiLogin,
} from "frontend/integration/internet-identity"
import {
  apiResultToLoginResult,
  LoginResult,
} from "frontend/integration/internet-identity/api-result-to-login-result"

export interface User {
  principal: string
  chain: DelegationChain
  sessionKey: Ed25519KeyIdentity
}

const loadingAtom = atom<boolean>(false)
const shouldStoreLocalAccountAtom = atom<boolean>(true)

const useAuthState = () => {
  const [{ delegationIdentity, cacheLoaded }, setDelegationIdentity] =
    React.useState(authState.get())

  React.useEffect(() => {
    const observer = authState.subscribe((authState) => {
      setDelegationIdentity(authState)
    })
    return () => observer.unsubscribe()
  }, [setDelegationIdentity])

  const isAuthenticated = React.useMemo(
    () => !isDelegationExpired(delegationIdentity),
    [delegationIdentity],
  )
  console.debug("useAuthState", { isAuthenticated })
  return { isAuthenticated, cacheLoaded }
}

let user: User | undefined = undefined

export function setUser(userState: User | undefined) {
  user = userState
}

export const useAuthentication = () => {
  const [isLoading, setIsLoading] = useAtom(loadingAtom)
  const [userNumber] = useAtom(userNumberAtom)
  const [shouldStoreLocalAccount, setShouldStoreLocalAccount] = useAtom(
    shouldStoreLocalAccountAtom,
  )

  const { isAuthenticated, cacheLoaded } = useAuthState()

  const logout = React.useCallback(() => {
    authState.logout()
    setUser(undefined)
    Sentry.setUser(null)

    // NOTE: after dom ready reload the page so thate safari is able to authenticate again
    setTimeout(() => {
      window.location.reload()
    })

    Usergeek.setPrincipal(Principal.anonymous())
  }, [])

  const initUserGeek = React.useCallback((principal: Principal) => {
    Usergeek.setPrincipal(principal)
    Usergeek.trackSession()
  }, [])

  const login = React.useCallback(
    async (
      userNumberOverwrite?: bigint,
      withSecurityDevices?: boolean,
    ): Promise<LoginResult> => {
      setIsLoading(true)
      const anchor = userNumberOverwrite || userNumber

      if (!anchor) {
        throw new Error("useAuthentication.login Register first")
      }

      const response = await iiLogin(anchor, withSecurityDevices)

      const result = apiResultToLoginResult(response)
      const principal = await agent.getPrincipal()

      if (result.tag === "err") {
        setIsLoading(false)
        return result
      }

      if (result.tag === "ok") {
        Sentry.setUser({ id: anchor.toString() })
        initUserGeek(principal)
        setUser({
          principal: principal.toText(),
          chain: result.chain,
          sessionKey: result.sessionKey,
        })
        setIsLoading(false)
        return result
      }

      setIsLoading(false)
      return result
    },
    [initUserGeek, setIsLoading, userNumber],
  )

  const loginWithRecovery = React.useCallback(
    async (seedPhrase: string, userNumber: bigint) => {
      setIsLoading(true)

      // TODO improve refetch. once in 20 times not fetching correctly
      let recoveryDevices = await fetchRecoveryDevices(userNumber)
      if (!recoveryDevices.length) {
        recoveryDevices = await fetchRecoveryDevices(userNumber)
      }

      const recoveryPhraseDevice = recoveryDevices.find((device) =>
        hasOwnProperty(device.key_type, "seed_phrase"),
      )

      if (!recoveryPhraseDevice) {
        setIsLoading(false)
        throw new Error("useAuthentication.loginWithRecovery No devices found")
      }

      const response = await fromSeedPhrase(
        userNumber,
        seedPhrase,
        recoveryPhraseDevice,
      )

      const result = apiResultToLoginResult(response)

      if (result.tag === "ok") {
        setUser({
          principal: (await agent.getPrincipal()).toText(),
          chain: result.chain,
          sessionKey: result.sessionKey,
        })
        initUserGeek(await agent.getPrincipal())
        setShouldStoreLocalAccount(false)
      }

      setIsLoading(false)
      return result
    },
    [initUserGeek, setIsLoading, setShouldStoreLocalAccount],
  )

  return {
    isLoading,
    isAuthenticated,
    cacheLoaded,
    user,
    shouldStoreLocalAccount,
    setShouldStoreLocalAccount,
    login,
    logout,
    loginWithRecovery,
  }
}
