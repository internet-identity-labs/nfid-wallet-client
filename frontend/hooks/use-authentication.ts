import { ActorSubclass } from "@dfinity/agent"
import { DelegationChain, Ed25519KeyIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { useUnknownDeviceConfig } from "frontend/flows/screens-iframe/authenticate/login-unknown/hooks/use-unknown-device.config"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { _SERVICE as IdentityManagerService } from "frontend/services/identity-manager/identity_manager.did"
import { apiResultToLoginResult } from "frontend/services/internet-identity/api-result-to-login-result"
import { IIConnection } from "frontend/services/internet-identity/iiConnection"
import { parseUserNumber } from "frontend/services/internet-identity/userNumber"
import { _SERVICE as PubsubChannelService } from "frontend/services/pub-sub-channel/pub_sub_channel.did"
import { atom, useAtom } from "jotai"
import React from "react"
import { Usergeek } from "usergeek-ic-js"

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

    console.log("result", result, userNumber)

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
    async (seedPhrase: string, userNumber: bigint) => {
      try {
        setIsLoading(true)

        const recoveryDevices = await IIConnection.lookupRecovery(userNumber)

        if (recoveryDevices.length === 0) {
          throw new Error("No devices found")
        }

        console.log("recoveryDevices[0]", recoveryDevices[0])

        const response = await IIConnection.fromSeedPhrase(
          userNumber,
          seedPhrase,
          recoveryDevices[0],
        )

        const result = apiResultToLoginResult(response)

        if (result.tag === "err") {
          setIsLoading(false)
          setError(result)
        }

        if (result.tag === "ok") {
          setActors(result)
          initUserGeek(
            result.internetIdentity.delegationIdentity.getPrincipal(),
          )
          setIsLoading(false)
          setError(null)
        }

        return result
      } catch (error) {
        setError("Invalid Recovery Phrase")
        setIsLoading(false)
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
    onRegisterSuccess,
    loginWithRecovery,
  }
}
