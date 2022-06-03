import { ActorSubclass } from "@dfinity/agent"
import { DelegationChain, Ed25519KeyIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { atom, useAtom } from "jotai"
import React from "react"
import { Usergeek } from "usergeek-ic-js"

import { userNumberAtom } from "frontend/services/identity-manager/account/state"
import { _SERVICE as IdentityManagerService } from "frontend/services/identity-manager/identity_manager.did"
import { _SERVICE as ImAdditionsService } from "frontend/services/iiw/im_addition.did"
import {
  apiResultToLoginResult,
  LoginResult,
} from "frontend/services/internet-identity/api-result-to-login-result"
import { IIConnection } from "frontend/services/internet-identity/iiConnection"
import { _SERVICE as PubsubChannelService } from "frontend/services/pub-sub-channel/pub_sub_channel.did"

interface Actors {
  chain: DelegationChain
  sessionKey: Ed25519KeyIdentity
  internetIdentity: IIConnection
  identityManager: ActorSubclass<IdentityManagerService>
  pubsubChannelActor: ActorSubclass<PubsubChannelService>
  imAdditionActor: ActorSubclass<ImAdditionsService>
}

const errorAtom = atom<any | null>(null)
const loadingAtom = atom<boolean>(false)
const remoteLoginAtom = atom<boolean>(false)
const shouldStoreLocalAccountAtom = atom<boolean>(true)
const actorsAtom = atom<Actors | null>(null)
const isAuthenticatedAtom = atom((get) => get(actorsAtom) !== null)
export const principalIdAtom = atom((get) =>
  get(actorsAtom)
    ?.internetIdentity?.delegationIdentity.getPrincipal()
    .toString(),
)

export const useAuthentication = () => {
  const [error, setError] = useAtom(errorAtom)
  const [isAuthenticated] = useAtom(isAuthenticatedAtom)
  const [isLoading, setIsLoading] = useAtom(loadingAtom)
  const [userNumber] = useAtom(userNumberAtom)
  const [isRemoteDelegate, setIsRemoteDelegate] = useAtom(remoteLoginAtom)
  const [shouldStoreLocalAccount, setShouldStoreLocalAccount] = useAtom(
    shouldStoreLocalAccountAtom,
  )
  const [actors, setActors] = useAtom(actorsAtom)
  const [principalId] = useAtom(principalIdAtom)

  const logout = React.useCallback(() => {
    setActors(null)
    // @ts-ignore TODO: remove this
    Usergeek.setPrincipal(Principal.anonymous())
  }, [setActors])

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

      if (result.tag === "err") {
        setError(result)
        setIsLoading(false)
        return result
      }

      if (result.tag === "ok") {
        setActors(result)
        initUserGeek(
          result?.internetIdentity?.delegationIdentity.getPrincipal(),
        )
        setError(null)
        return result
      }

      setIsLoading(false)
      return result
    },
    [initUserGeek, setActors, setError, setIsLoading, userNumber],
  )

  const remoteLogin = React.useCallback(
    async (actors) => {
      setIsRemoteDelegate(true)
      setActors(actors)
    },
    [setActors, setIsRemoteDelegate],
  )

  const onRegisterSuccess = React.useCallback(
    (actors) => {
      setActors(actors)
    },
    [setActors],
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
        setActors(result)
        initUserGeek(
          result?.internetIdentity?.delegationIdentity.getPrincipal(),
        )
        result.identityManager.use_access_point()
        setShouldStoreLocalAccount(false)
        setError(null)
      }

      setIsLoading(false)
      return result
    },
    [
      initUserGeek,
      setActors,
      setError,
      setIsLoading,
      setShouldStoreLocalAccount,
    ],
  )

  return {
    isLoading,
    principalId,
    isAuthenticated,
    chain: actors?.chain,
    sessionKey: actors?.sessionKey,
    internetIdentity: actors?.internetIdentity,
    identityManager: actors?.identityManager,
    pubsubChannel: actors?.pubsubChannelActor,
    imAddition: actors?.imAdditionActor,
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
