import { DelegationChain, Ed25519KeyIdentity } from "@icp-sdk/core/identity"
import { atom, useAtom } from "jotai"
import React from "react"

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
import { ttlCacheService } from "@nfid/client-db"
import { mutate } from "@nfid/swr"
import { INITED_TOKENS_CACHE_NAME } from "frontend/integration/ft/ft-service"
import { ICRC1_ORACLE_CACHE_NAME } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"
import { ICRC1_REGISTRY_CACHE_NAME } from "@nfid/integration/token/icrc1/service/icrc1-registry-service"
import { EVM_BALANCE_CACHE_NAME } from "frontend/integration/ethereum/evm.service"
import {
  ERC20_BALANCES_CACHE_NAME,
  ERC20_TOKENS_CACHE_NAME,
  ERC20_TOKENS_LIST_CACHE_NAME,
} from "frontend/integration/ethereum/erc20-abstract.service"

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

    // NOTE: after dom ready reload the page so thate safari is able to authenticate again
    setTimeout(() => {
      window.location.href = "/"
    }, 100)
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
        setUser({
          principal: principal.toText(),
          chain: result.chain,
          sessionKey: result.sessionKey,
        })
        setIsLoading(false)
        return result
      }

      await ttlCacheService.invalidate([
        INITED_TOKENS_CACHE_NAME,
        ICRC1_ORACLE_CACHE_NAME,
        ICRC1_REGISTRY_CACHE_NAME,
        EVM_BALANCE_CACHE_NAME,
        ERC20_TOKENS_LIST_CACHE_NAME,
        ERC20_TOKENS_CACHE_NAME,
        ERC20_BALANCES_CACHE_NAME,
      ])
      await mutate("tokens")
      await mutate("initedTokens")
      await mutate("ftUsdValue")

      setIsLoading(false)
      return result
    },
    [setIsLoading, userNumber],
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
          setShouldStoreLocalAccount(false)
        }
        setIsLoading(false)
        return {
          ...result,
          profile: {
            anchor: userNumber.toString(),
          },
        }
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
          const profile = await fetchProfile()
          await authState.set({
            identity,
            delegationIdentity: delegationIdentity,
          })
          setIsLoading(false)

          return {
            tag: "ok",
            chain: chain,
            sessionKey: sessionKey,
            profile: {
              anchor: profile.anchor,
              name: profile.name,
            },
          }
        } catch (_e) {
          setIsLoading(false)
          return {
            tag: "err",
            title: "Incorrect seed phrase",
            message: "",
          } as LoginError
        }
      }
    },
    [setIsLoading, setShouldStoreLocalAccount],
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
