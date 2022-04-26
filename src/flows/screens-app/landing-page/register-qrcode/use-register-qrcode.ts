import { blobToHex } from "@dfinity/candid"
import { Ed25519KeyIdentity } from "@dfinity/identity"
import { useCallback, useMemo } from "react"

import { AppScreenAuthorizeAppConstants } from "frontend/flows/screens-app/authorize-app/routes"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { apiResultToLoginResult } from "frontend/services/internet-identity/api-result-to-login-result"
import { IIConnection } from "frontend/services/internet-identity/iiConnection"
import { usePubSubChannel } from "frontend/services/pub-sub-channel/use-pub-sub-channel"
import { atom, useAtom } from "jotai"
import { useUnknownDeviceConfig } from "frontend/flows/screens-iframe/authenticate/login-unknown/hooks/use-unknown-device.config"

const statusAtom = atom<string>("")

export const useRegisterQRCode = () => {
  const [status, setStatus] = useAtom(statusAtom)
  const { setUserNumber } = useUnknownDeviceConfig()

  const { getMessages } = usePubSubChannel()
  const { remoteLogin: setAuthenticatedActors } = useAuthentication()

  const publicKey = useMemo(
    () => blobToHex(Ed25519KeyIdentity.generate().getPublicKey().toDer()),
    [],
  )

  const registerRoute = useMemo(
    () => `${AppScreenAuthorizeAppConstants.base}/${publicKey}/NFID/intro`,
    [publicKey],
  )

  const url = useMemo(() => {
    return `https://${window.location.host}${registerRoute}`
  }, [registerRoute])

  const handleLoginFromRemoteDelegation = useCallback(
    async (nfidJsonDelegate, userNumber) => {
      console.log(">> handleLoginFromRemoteDelegation", { userNumber })

      const loginResult = await IIConnection.loginFromRemoteFrontendDelegation({
        chain: JSON.stringify(nfidJsonDelegate.chain),
        sessionKey: JSON.stringify(nfidJsonDelegate.sessionKey),
        userNumber: BigInt(userNumber),
      })
      const result = apiResultToLoginResult(loginResult)
      console.log(">> handleLoginFromRemoteDelegation", { result })

      if (result.tag === "ok") {
        setAuthenticatedActors(result)
        setStatus("registerDecider")
        setUserNumber(BigInt(userNumber))
      }
      // TODO: handle this more gracefully
      if (result.tag !== "ok") throw new Error("login failed")
    },
    [setAuthenticatedActors, setStatus, setUserNumber],
  )

  const handlePollForDelegate = useCallback(
    async (cancelPoll: () => void) => {
      const {
        body: [messages],
      } = await getMessages(publicKey)

      if (messages && messages.length > 0) {
        const parsedMessages = messages.map((m: string) => JSON.parse(m))

        const registerMessage = parsedMessages.find(
          (m: { type: string }) => m.type === "remote-login-register",
        )

        if (registerMessage) {
          console.log(">> handlePollForDelegate", { registerMessage })

          handleLoginFromRemoteDelegation(
            registerMessage.nfid,
            registerMessage.userNumber,
          )

          cancelPoll()
        }
      }
    },
    [getMessages, handleLoginFromRemoteDelegation, publicKey],
  )

  return {
    url,
    registerRoute,
    handlePollForDelegate,
    status,
    setStatus,
  }
}
