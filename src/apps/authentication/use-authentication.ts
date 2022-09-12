import { DelegationChain, Ed25519KeyIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import * as Sentry from "@sentry/browser"
import { atom, useAtom } from "jotai"
import React from "react"
import { Usergeek } from "usergeek-ic-js"

import { agent, invalidateIdentity } from "frontend/integration/actors"
import { userNumberAtom } from "frontend/integration/identity-manager/account/state"
import {
  authState,
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
const authenticationAtom = atom<boolean>(false)
const shouldStoreLocalAccountAtom = atom<boolean>(true)

let user: User | undefined = undefined

export function setUser(userState: User | undefined) {
  user = userState
}

export const useAuthentication = () => {
  const [isLoading, setIsLoading] = useAtom(loadingAtom)
  const [userNumber] = useAtom(userNumberAtom)
  const [isAuthenticated, setIsAuthenticated] = useAtom(authenticationAtom)
  const [shouldStoreLocalAccount, setShouldStoreLocalAccount] = useAtom(
    shouldStoreLocalAccountAtom,
  )

  React.useEffect(() => {
    const observer = authState.subscribe(({ delegationIdentity }) => {
      setIsAuthenticated(!!delegationIdentity)
    })
    return () => observer.unsubscribe()
  }, [setIsAuthenticated])

  const logout = React.useCallback(() => {
    invalidateIdentity()
    setUser(undefined)
    Sentry.setUser(null)
    // TODO: this is a quick fix after the auth state refactor.
    // The problem is that after we invalidate the identity, the
    // frontend throws the error:
    // This identity has expired due this application's security policy. Please refresh your authentication.
    // SENTRY: https://sentry.io/organizations/internet-identity-labs/issues/3364199030/?project=6424378&referrer=slack
    // TICKET: https://app.shortcut.com/the-internet-portal/story/2695/log-out-when-delegate-expires
    window.location.href = "/"
    // @ts-ignore TODO: remove this
    Usergeek.setPrincipal(Principal.anonymous())
  }, [])

  const initUserGeek = React.useCallback((principal: Principal) => {
    // TODO: create pull request removing the requirement of
    // @dfinity/auth-client to be installed
    // they just use LocalStorage implementation from it.

    // @ts-ignore TODO: remove this
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
        setIsAuthenticated(true)
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
    [initUserGeek, setIsAuthenticated, setIsLoading, userNumber],
  )

  const loginWithRecovery = React.useCallback(
    async (seedPhrase: string, userNumber: bigint) => {
      setIsLoading(true)

      // TODO improve refetch. once in 20 times not fetching correctly
      let recoveryDevices = await fetchRecoveryDevices(userNumber)
      if (!recoveryDevices.length) {
        recoveryDevices = await fetchRecoveryDevices(userNumber)
      }

      const recoveryPhraseDevice = recoveryDevices.find(
        (device) => device.alias === "Recovery phrase",
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
    user,
    shouldStoreLocalAccount,
    setShouldStoreLocalAccount,
    login,
    logout,
    loginWithRecovery,
  }
}
