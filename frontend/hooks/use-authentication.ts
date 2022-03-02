import { Usergeek } from "usergeek-ic-js"
import { ActorSubclass } from "@dfinity/agent"
import { DelegationChain, Ed25519KeyIdentity } from "@dfinity/identity"

import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { _SERVICE as IdentityManagerService } from "frontend/services/identity-manager/identity_manager.did"
import { apiResultToLoginResult } from "frontend/services/internet-identity/api-result-to-login-result"
import {
  derFromPubkey,
  IC_DERIVATION_PATH,
  IIConnection,
} from "frontend/services/internet-identity/iiConnection"
import { _SERVICE as PubsubChannelService } from "frontend/services/pub-sub-channel/pub_sub_channel.did"
import { atom, useAtom } from "jotai"
import React from "react"
import { Principal } from "@dfinity/principal"
import { fromMnemonicWithoutValidation } from "frontend/services/internet-identity/crypto/ed25519"

interface Actors {
  chain: DelegationChain
  sessionKey: Ed25519KeyIdentity
  internetIdentity: IIConnection
  identityManager: ActorSubclass<IdentityManagerService>
  pubsubChannelActor: ActorSubclass<PubsubChannelService>
}

const errorAtom = atom<any | null>(null)
const loadingAtom = atom<boolean>(false)
const actorsAtom = atom<Actors | null>(null)
const isAuthenticatedAtom = atom((get) => get(actorsAtom) !== null)
export const principalIdAtom = atom((get) =>
  get(actorsAtom)
    ?.internetIdentity.delegationIdentity.getPrincipal()
    .toString(),
)

export const useAuthentication = () => {
  const [error, setError] = useAtom(errorAtom)
  const [isAuthenticated] = useAtom(isAuthenticatedAtom)
  const [isLoading, setIsLoading] = useAtom(loadingAtom)
  const [actors, setActors] = useAtom(actorsAtom)
  const [principalId] = useAtom(principalIdAtom)

  const { userNumber } = useAccount()

  const logout = React.useCallback(() => {
    setActors(null)
    Usergeek.setPrincipal(Principal.anonymous())
  }, [setActors])

  const initUserGeek = React.useCallback((principal: Principal) => {
    // TODO: create pull request removing the requirement of
    // @dfinity/auth-client to be installed
    // they just use LocalStorage implementation from it.

    // TODO: remove logger before release
    console.log(">> initUserGeek", { principalId: principal.toString() })

    Usergeek.setPrincipal(principal)
    Usergeek.trackSession()
  }, [])

  const login = React.useCallback(async () => {
    setIsLoading(true)

    if (!userNumber) {
      throw new Error("register first")
    }

    const response = await IIConnection.login(userNumber)
    const result = apiResultToLoginResult(response)

    if (result.tag === "err") {
      setError(result)
      setIsLoading(false)
      return
    }

    if (result.tag === "ok") {
      setActors(result)
      initUserGeek(result.internetIdentity.delegationIdentity.getPrincipal())
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(false)
  }, [initUserGeek, setActors, setError, setIsLoading, userNumber])

  const onRegisterSuccess = React.useCallback(
    (actors) => {
      setActors(actors)
    },
    [setActors],
  )

  const loginWithRecovery = React.useCallback(
    async (seedPhrase: string) => {
      setIsLoading(true)

      const [userNumber] = seedPhrase.split(" ")[0]
      const _userNumber = BigInt(userNumber)

      // FIX: recovery devices returns null
      const recoveryDevices = await IIConnection.lookupRecovery(_userNumber)

      console.log("devices", recoveryDevices)

      if (recoveryDevices.length === 0) {
        throw new Error("no devices found")
      }

      const response = await IIConnection.fromSeedPhrase(
        _userNumber,
        seedPhrase,
        recoveryDevices[0],
      )

      const result = apiResultToLoginResult(response)

      if (result.tag === "err") {
        setError(result)
        setIsLoading(false)
        console.log('"error"', "error")
      }

      if (result.tag === "ok") {
        setActors(result)
        initUserGeek(result.internetIdentity.delegationIdentity.getPrincipal())
        setIsLoading(false)
        console.log("success result", result)
      }
    },
    [initUserGeek, setActors, setError, setIsLoading],
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
    error,
    login,
    logout,
    error,
    onRegisterSuccess,
    loginWithRecovery,
  }
}
