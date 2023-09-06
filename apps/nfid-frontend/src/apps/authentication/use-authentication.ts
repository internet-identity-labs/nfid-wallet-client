import { DelegationChain, Ed25519KeyIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import * as Sentry from "@sentry/browser"
import { atom, useAtom } from "jotai"
import React from "react"
import useSWRImmutable from "swr/immutable"
import { Usergeek } from "usergeek-ic-js"

import {
  ObservableAuthState,
  authState as asyncAuthState,
} from "@nfid/integration"
import {
  authState,
  hasOwnProperty,
  im,
  isDelegationExpired,
  replaceActorIdentity,
  requestFEDelegation,
} from "@nfid/integration"
import { agent } from "@nfid/integration"

import { fetchProfile } from "frontend/integration/identity-manager"
import { userNumberAtom } from "frontend/integration/identity-manager/account/state"
import {
  IC_DERIVATION_PATH,
  fetchRecoveryDevices,
  fromSeedPhrase,
  login as iiLogin,
} from "frontend/integration/internet-identity"
import {
  apiResultToLoginResult,
  LoginError,
  LoginResult,
} from "frontend/integration/internet-identity/api-result-to-login-result"
import { fromMnemonicWithoutValidation } from "frontend/integration/internet-identity/crypto/ed25519"

export interface User {
  principal: string
  chain: DelegationChain
  sessionKey: Ed25519KeyIdentity
}

const loadingAtom = atom<boolean>(false)
const shouldStoreLocalAccountAtom = atom<boolean>(true)

export const useAsyncAuthState = (
  onChange?: (state: ObservableAuthState) => void,
) => {
  const { data: authState } = useSWRImmutable("authState", () => asyncAuthState)
  React.useEffect(() => {
    let sub = { unsubscribe: () => {} }
    if (authState && onChange) {
      sub = authState.subscribe(onChange)
    }
    return () => sub.unsubscribe()
  }, [authState, onChange])
  return authState
}

const useAuthState = () => {
  const [{ delegationIdentity, cacheLoaded }, setDelegationIdentity] =
    React.useState<ObservableAuthState>({
      delegationIdentity: undefined,
      cacheLoaded: false,
    })

  useAsyncAuthState(setDelegationIdentity)

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
  const authState = useAsyncAuthState()
  const [isLoading, setIsLoading] = useAtom(loadingAtom)
  const [userNumber] = useAtom(userNumberAtom)
  const [shouldStoreLocalAccount, setShouldStoreLocalAccount] = useAtom(
    shouldStoreLocalAccountAtom,
  )

  const { isAuthenticated, cacheLoaded } = useAuthState()

  const logout = React.useCallback(async () => {
    if (!authState) throw new Error("authState not hydrated")
    await authState.logout()
    setUser(undefined)
    Sentry.setUser(null)

    // NOTE: after dom ready reload the page so thate safari is able to authenticate again
    setTimeout(() => {
      window.location.reload()
    })

    Usergeek.setPrincipal(Principal.anonymous())
  }, [authState])

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

      // Recover legacy users
      if (userNumber < 100000000) {
        let recoveryDevices = await fetchRecoveryDevices(userNumber)
        if (!recoveryDevices.length) {
          recoveryDevices = await fetchRecoveryDevices(userNumber)
        }

        const recoveryPhraseDevice = recoveryDevices.find((device) =>
          hasOwnProperty(device.key_type, "seed_phrase"),
        )

        if (!recoveryPhraseDevice) {
          setIsLoading(false)
          return {
            tag: "err",
            title: "Unknown anchor",
            message: "",
          } as LoginError
        }

        let result: LoginResult

        try {
          const response = await fromSeedPhrase(
            userNumber,
            seedPhrase,
            recoveryPhraseDevice,
          )
          result = apiResultToLoginResult(response)
        } catch (e: any) {
          setIsLoading(false)
          throw new Error(e.message)
        }

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
      } else {
        // Recover new users
        const identity = await fromMnemonicWithoutValidation(
          seedPhrase,
          IC_DERIVATION_PATH,
        )

        const { delegationIdentity, chain, sessionKey } =
          await requestFEDelegation(identity)
        await replaceActorIdentity(im, delegationIdentity)

        try {
          await fetchProfile()
        } catch (e) {
          setIsLoading(false)
          return {
            tag: "err",
            title: "Incorrect seed phrase",
            message: "",
          } as LoginError
        }

        if (!authState) throw new Error("authState not hydrated")
        authState.set({
          identity,
          delegationIdentity: delegationIdentity,
        })
        setIsLoading(false)

        return {
          tag: "ok",
          chain: chain,
          sessionKey: sessionKey,
        }
      }
    },
    [authState, initUserGeek, setIsLoading, setShouldStoreLocalAccount],
  )

  return {
    authState,
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
