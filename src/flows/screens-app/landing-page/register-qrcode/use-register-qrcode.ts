import { blobToHex } from "@dfinity/candid"
import { Ed25519KeyIdentity } from "@dfinity/identity"
import { atom, useAtom } from "jotai"
import { useCallback, useMemo } from "react"
import { generatePath } from "react-router-dom"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useUnknownDeviceConfig } from "frontend/screens/remote-authorize-app-unknown-device/hooks/use-unknown-device.config"
import { apiResultToLoginResult } from "frontend/services/internet-identity/api-result-to-login-result"
import { IIConnection } from "frontend/services/internet-identity/iiConnection"
import { usePubSubChannel } from "frontend/services/pub-sub-channel/use-pub-sub-channel"

import { RemoteNFIDAuthenticationConstants } from "../../remote-nfid-authentication"

const statusAtom = atom<string>("")

export const useRegisterQRCode = () => {
  const [status, setStatus] = useAtom(statusAtom)
  const { setUserNumber } = useUnknownDeviceConfig()

  const { getMessages } = usePubSubChannel()
  const { remoteLogin: setAuthenticatedActors, setShouldStoreLocalAccount } =
    useAuthentication()

  const publicKey = useMemo(
    () => blobToHex(Ed25519KeyIdentity.generate().getPublicKey().toDer()),
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
    async (nfidJsonDelegate, userNumber) => {
      const loginResult = await IIConnection.loginFromRemoteFrontendDelegation({
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
      const {
        body: [messages],
      } = await getMessages(publicKey)

      if (messages && messages.length > 0) {
        const parsedMessages = messages.map((m: string) => JSON.parse(m))

        const registerMessage = parsedMessages.find(
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
