import { toHexString } from "@dfinity/candid/lib/cjs/utils/buffer"
import { Ed25519KeyIdentity } from "@dfinity/identity"
import { atom, useAtom } from "jotai"
import { useCallback, useMemo } from "react"
import { generatePath } from "react-router-dom"

import { useUnknownDeviceConfig } from "frontend/design-system/pages/remote-authorize-app-unknown-device/hooks/use-unknown-device.config"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { RemoteLoginEvent } from "frontend/apps/authorization/use-authorize-app"
import { loginFromRemoteFrontendDelegation } from "frontend/integration/internet-identity"
import { apiResultToLoginResult } from "frontend/integration/internet-identity/api-result-to-login-result"
import { getMessages } from "frontend/integration/pubsub"

import { RemoteNFIDAuthenticationConstants } from "../../../authentication/remote-nfid-authentication"

const statusAtom = atom<string>("")

export const useRegisterQRCode = () => {
  const [status, setStatus] = useAtom(statusAtom)
  const { setUserNumber } = useUnknownDeviceConfig()

  const { remoteLogin: setAuthenticatedActors, setShouldStoreLocalAccount } =
    useAuthentication()

  const publicKey = useMemo(
    () => toHexString(Ed25519KeyIdentity.generate().getPublicKey().toDer()),
    [],
  )

  const registerRoute = useMemo(
    () =>
      generatePath(RemoteNFIDAuthenticationConstants.authorize, {
        secret: publicKey,
        scope: "NFID",
      }),
    [publicKey],
  )

  const url = useMemo(() => {
    return `https://${window.location.host}${registerRoute}`
  }, [registerRoute])

  const handleLoginFromRemoteDelegation = useCallback(
    async (
      nfidJsonDelegate: RemoteLoginEvent["nfid"],
      userNumber: RemoteLoginEvent["userNumber"],
    ) => {
      const loginResult = await loginFromRemoteFrontendDelegation({
        chain: JSON.stringify(nfidJsonDelegate.chain),
        sessionKey: JSON.stringify(nfidJsonDelegate.sessionKey),
        userNumber: BigInt(userNumber),
      })
      const result = apiResultToLoginResult(loginResult)

      if (result.tag === "ok") {
        setShouldStoreLocalAccount(false)
        setAuthenticatedActors(result)
        setStatus("registerDecider")
        setUserNumber(BigInt(userNumber))
      }
      // TODO: handle this more gracefully
      if (result.tag !== "ok") throw new Error("login failed")
    },
    [
      setAuthenticatedActors,
      setShouldStoreLocalAccount,
      setStatus,
      setUserNumber,
    ],
  )

  const handlePollForDelegate = useCallback(
    async (cancelPoll: () => void) => {
      const messages = await getMessages(publicKey)

      if (messages && messages.length > 0) {
        const parsedMessages = messages.map((m: string) => JSON.parse(m))

        const registerMessage: RemoteLoginEvent = parsedMessages.find(
          (m: { type: string }) => m.type === "remote-nfid-login-register",
        )

        if (registerMessage) {
          handleLoginFromRemoteDelegation(
            registerMessage.nfid,
            registerMessage.userNumber,
          )

          cancelPoll()
        }
      }
    },
    [handleLoginFromRemoteDelegation, publicKey],
  )

  return {
    url,
    registerRoute,
    handlePollForDelegate,
    status,
    setStatus,
  }
}
