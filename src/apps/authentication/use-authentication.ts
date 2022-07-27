import { SignIdentity } from "@dfinity/agent"
import { DelegationChain, Ed25519KeyIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { atom, useAtom } from "jotai"
import React from "react"
import { Usergeek } from "usergeek-ic-js"

import { agent, im, invalidateIdentity } from "frontend/integration/actors"
import { userNumberAtom } from "frontend/integration/identity-manager/account/state"
import {
  authState,
  fetchRecoveryDevices,
  fromSeedPhrase,
  getReconstructableIdentity,
  login as iiLogin,
  loginfromGoogleDevice,
} from "frontend/integration/internet-identity"
import {
  apiResultToLoginResult,
  LoginResult,
  LoginSuccess,
} from "frontend/integration/internet-identity/api-result-to-login-result"

export interface User {
  principal: string
  chain: DelegationChain
  sessionKey: Ed25519KeyIdentity
}

const errorAtom = atom<any | null>(null)
const loadingAtom = atom<boolean>(false)
const remoteLoginAtom = atom<boolean>(false)
const shouldStoreLocalAccountAtom = atom<boolean>(true)

let user: User | undefined = undefined

export function setUser(userState: User | undefined) {
  user = userState
}

export const useAuthentication = () => {
  const [error, setError] = useAtom(errorAtom)
  const [isLoading, setIsLoading] = useAtom(loadingAtom)
  const [userNumber] = useAtom(userNumberAtom)
  const [isRemoteDelegate, setIsRemoteDelegate] = useAtom(remoteLoginAtom)
  const [shouldStoreLocalAccount, setShouldStoreLocalAccount] = useAtom(
    shouldStoreLocalAccountAtom,
  )

  const logout = React.useCallback(() => {
    invalidateIdentity()
    setUser(undefined)
    // TODO: this is a quick fix after the auth state refactor.
    // The problem is that after we invalidate the identity, the
    // frontend throws the error:
    // This identity has expired due this application's security policy. Please refresh your authentication.
    // SENTRY: https://sentry.io/organizations/internet-identity-labs/issues/3364199030/?project=6424378&referrer=slack
    // TICKET: https://app.shortcut.com/the-internet-portal/story/2695/log-out-when-delegate-expires
    window.location.reload()
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
        throw new Error("Register first")
      }

      const response = await iiLogin(anchor, withSecurityDevices)

      const result = apiResultToLoginResult(response)
      const principal = await agent.getPrincipal()

      if (result.tag === "err") {
        setError(result)
        setIsLoading(false)
        return result
      }

      if (result.tag === "ok") {
        initUserGeek(principal)
        setUser({
          principal: principal.toText(),
          chain: result.chain,
          sessionKey: result.sessionKey,
        })
        setError(null)
        setIsLoading(false)
        return result
      }

      setIsLoading(false)
      return result
    },
    [initUserGeek, setError, setIsLoading, userNumber],
  )

  const remoteLogin = React.useCallback(
    async (actors: LoginSuccess) => {
      setIsRemoteDelegate(true)
      setUser({
        principal: (await agent.getPrincipal()).toText(),
        chain: actors.chain,
        sessionKey: actors.sessionKey,
      })
    },
    [setIsRemoteDelegate],
  )

  const onRegisterSuccess = React.useCallback(async (actors: LoginSuccess) => {
    const user = {
      principal: (await agent.getPrincipal()).toText(),
      chain: actors.chain,
      sessionKey: actors.sessionKey,
    }
    setUser(user)
    return user
  }, [])

  const loginWithRecovery = React.useCallback(
    async (seedPhrase: string, userNumber: bigint) => {
      setIsLoading(true)

      const recoveryDevices = await fetchRecoveryDevices(userNumber)

      if (recoveryDevices.length === 0) {
        throw new Error("No devices found")
      }

      const response = await fromSeedPhrase(
        userNumber,
        seedPhrase,
        recoveryDevices[0],
      )

      const result = apiResultToLoginResult(response)

      if (result.tag === "err") {
        setError(result)
      }

      if (result.tag === "ok") {
        setUser({
          principal: (await agent.getPrincipal()).toText(),
          chain: result.chain,
          sessionKey: result.sessionKey,
        })
        initUserGeek(await agent.getPrincipal())
        im.use_access_point().catch((e) => {
          throw new Error(
            `${loginWithRecovery.name} im.use_access_point: ${e.message}`,
          )
        })
        setShouldStoreLocalAccount(false)
        setError(null)
      }

      setIsLoading(false)
      return result
    },
    [initUserGeek, setError, setIsLoading, setShouldStoreLocalAccount],
  )

  const loginWithGoogleDevice = React.useCallback(
    async (identity: string) => {
      await loginfromGoogleDevice(identity)
      const result = await getReconstructableIdentity(
        authState.get().identity as SignIdentity,
      )
      const user = {
        principal: (await agent.getPrincipal()).toText(),
        chain: result.chain,
        sessionKey: result.sessionKey,
      }
      setUser(user)
      initUserGeek(await agent.getPrincipal())
      im.use_access_point()
      setShouldStoreLocalAccount(false)
      setError(null)
      return user
    },
    [initUserGeek, setError, setShouldStoreLocalAccount],
  )

  return {
    isLoading,
    user,
    error,
    shouldStoreLocalAccount,
    setShouldStoreLocalAccount,
    isRemoteDelegate,
    login,
    remoteLogin,
    logout,
    onRegisterSuccess,
    loginWithRecovery,
    loginWithGoogleDevice,
  }
}
