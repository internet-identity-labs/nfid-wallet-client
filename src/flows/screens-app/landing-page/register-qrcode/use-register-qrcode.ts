import { blobToHex } from "@dfinity/candid"
import { Ed25519KeyIdentity } from "@dfinity/identity"
import { useCallback, useMemo } from "react"

import { AppScreenAuthorizeAppConstants } from "frontend/flows/screens-app/authorize-app/routes"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { apiResultToLoginResult } from "frontend/services/internet-identity/api-result-to-login-result"
import { IIConnection } from "frontend/services/internet-identity/iiConnection"
import { setUserNumber } from "frontend/services/internet-identity/userNumber"
import { usePubSubChannel } from "frontend/services/pub-sub-channel/use-pub-sub-channel"

export const useRegisterQRCode = () => {
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
      }
      // TODO: handle this more gracefully
      if (result.tag !== "ok") throw new Error("login failed")
    },
    [setAuthenticatedActors],
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

          setUserNumber(BigInt(registerMessage.userNumber))
          handleLoginFromRemoteDelegation(
            registerMessage.nfid,
            registerMessage.userNumber,
          )
        }
      }
    },
    [getMessages, handleLoginFromRemoteDelegation, publicKey],
  )

  return {
    url,
    registerRoute,
    handlePollForDelegate,
  }
}
