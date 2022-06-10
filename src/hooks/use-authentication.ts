import { DelegationChain, Ed25519KeyIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { atom, useAtom } from "jotai"
import React from "react"
import { Usergeek } from "usergeek-ic-js"

import { agent, im, invalidateIdentity } from "frontend/api/actors"
import { userNumberAtom } from "frontend/services/identity-manager/account/state"
import {
  apiResultToLoginResult,
  LoginResult,
  LoginSuccess,
} from "frontend/services/internet-identity/api-result-to-login-result"
import { IIConnection } from "frontend/services/internet-identity/iiConnection"

interface User {
  principal: string
  chain: DelegationChain
  sessionKey: Ed25519KeyIdentity
  internetIdentity: IIConnection
}

const errorAtom = atom<any | null>(null)
const loadingAtom = atom<boolean>(false)
const remoteLoginAtom = atom<boolean>(false)
const shouldStoreLocalAccountAtom = atom<boolean>(true)
const userAtom = atom<User | undefined>(undefined)

export const useAuthentication = () => {
  const [error, setError] = useAtom(errorAtom)
  const [user, setUser] = useAtom(userAtom)
  const [isLoading, setIsLoading] = useAtom(loadingAtom)
  const [userNumber] = useAtom(userNumberAtom)
  const [isRemoteDelegate, setIsRemoteDelegate] = useAtom(remoteLoginAtom)
  const [shouldStoreLocalAccount, setShouldStoreLocalAccount] = useAtom(
    shouldStoreLocalAccountAtom,
  )

  const logout = React.useCallback(() => {
    invalidateIdentity()
    setUser(undefined)
    // @ts-ignore TODO: remove this
    Usergeek.setPrincipal(Principal.anonymous())
  }, [setUser])

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

      const response = await IIConnection.login(anchor, withSecurityDevices)

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
          internetIdentity: result.internetIdentity,
        })
        setError(null)
        setIsLoading(false)
        return result
      }

      setIsLoading(false)
      return result
    },
    [initUserGeek, setError, setIsLoading, setUser, userNumber],
  )

  const remoteLogin = React.useCallback(
    async (actors: LoginSuccess) => {
      setIsRemoteDelegate(true)
      setUser({
        principal: (await agent.getPrincipal()).toText(),
        chain: actors.chain,
        sessionKey: actors.sessionKey,
        internetIdentity: actors.internetIdentity,
      })
    },
    [setUser, setIsRemoteDelegate],
  )

  const onRegisterSuccess = React.useCallback(
    async (actors) => {
      setUser({
        principal: (await agent.getPrincipal()).toText(),
        chain: actors.chain,
        sessionKey: actors.sessionKey,
        internetIdentity: actors.internetIdentity,
      })
    },
    [setUser],
  )

  const loginWithRecovery = React.useCallback(
    async (seedPhrase: string, userNumber: bigint) => {
      setIsLoading(true)

      const recoveryDevices = await IIConnection.lookupRecovery(userNumber)

      if (recoveryDevices.length === 0) {
        throw new Error("No devices found")
      }

      const response = await IIConnection.fromSeedPhrase(
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
          internetIdentity: result.internetIdentity,
        })
        initUserGeek(await agent.getPrincipal())
        im.use_access_point()
        setShouldStoreLocalAccount(false)
        setError(null)
      }

      setIsLoading(false)
      return result
    },
    [initUserGeek, setUser, setError, setIsLoading, setShouldStoreLocalAccount],
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
  }
}
