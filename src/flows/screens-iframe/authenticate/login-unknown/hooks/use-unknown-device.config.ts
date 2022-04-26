import { PublicKey } from "@dfinity/agent"
import { blobFromUint8Array, blobToHex } from "@dfinity/candid"
import { DelegationChain, Ed25519KeyIdentity } from "@dfinity/identity"
import { atom, useAtom } from "jotai"
import React from "react"
import { generatePath, useLocation } from "react-router-dom"

import { AppScreenAuthorizeAppConstants } from "frontend/flows/screens-app/authorize-app/routes"
import { RegisterNewDeviceConstants } from "frontend/flows/screens-app/register-new-from-delegate/routes"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useMultipass } from "frontend/hooks/use-multipass"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"
import { apiResultToLoginResult } from "frontend/services/internet-identity/api-result-to-login-result"
import { buildDelegate } from "frontend/services/internet-identity/build-delegate"
import { IIConnection } from "frontend/services/internet-identity/iiConnection"
import { usePubSubChannel } from "frontend/services/pub-sub-channel/use-pub-sub-channel"

import { useMessageChannel } from "./use-message-channel"

declare const FRONTEND_MODE: string

type loadingState = "initial" | "loading" | "success"

export type NfidJsonDelegate = {
  chain: DelegationChain | undefined
  sessionKey: Ed25519KeyIdentity | undefined
}

export type SignedDelegation = {
  delegation: {
    pubkey: PublicKey
    expiration: string
    targets: undefined
  }
  signature: number[]
  userKey: PublicKey
}

type StateProps = {
  userNumber?: bigint
  from?: string
}

const registerAtom = atom<boolean>(false)
const loadingAtom = atom<loadingState>("initial")

export const useUnknownDeviceConfig = () => {
  const [status, setStatus] = useAtom(loadingAtom)
  const [showRegister, setShowRegister] = useAtom(registerAtom)

  const { state } = useLocation()
  const [userNumber, setUserNumber] = React.useState<bigint | undefined>(
    (state as StateProps)?.userNumber,
  )
  const [fromPath, setFromPath] = React.useState((state as StateProps)?.from)

  const [
    signedDelegation,
    setSignedDelegation,
  ] = React.useState<SignedDelegation>()

  const [appWindow, setAppWindow] = React.useState<Window | null>(null)
  const [domain, setDomain] = React.useState("")
  const [pubKey, setPubKey] = React.useState("")
  const [newDeviceKey, setNewDeviceKey] = React.useState<any | null>(null)

  const { createDevice } = useDevices()
  const { applicationName } = useMultipass()
  const { getMessages } = usePubSubChannel()
  const { remoteLogin: setAuthenticatedActors } = useAuthentication()

  const url = React.useMemo(() => {
    // TODO: create custom hook to generate secret
    return domain && pubKey
      ? `${window.location.origin}${AppScreenAuthorizeAppConstants.base}/${pubKey}/${domain}/${applicationName}`
      : null
  }, [applicationName, domain, pubKey])

  const {
    isReady,
    postClientReadyMessage,
    postClientAuthorizeSuccessMessage,
  } = useMessageChannel({
    messageHandler: {
      "authorize-client": (event: any) => {
        const { sessionPublicKey } = event.data
        const blog = blobFromUint8Array(sessionPublicKey)
        const hex = blobToHex(blog)

        setAppWindow(event.source)
        setPubKey(hex)
        setDomain(new URL(event.origin).host)
      },
    },
  })

  const handleStoreNewDevice = React.useCallback(
    async ({ device }) => {
      if (!userNumber) throw new Error("No anchor found")

      setNewDeviceKey(device.publicKey)
      const response = await createDevice({
        ...device,
        userNumber: userNumber,
      })
      return response
    },
    [createDevice, userNumber],
  )

  React.useEffect(() => {
    isReady && postClientReadyMessage()
  }, [isReady, postClientReadyMessage])

  const handleRegisterDevice = React.useCallback(async () => {
    if (!userNumber) throw new Error("userNumber required")
    setStatus("loading")

    window.open(
      generatePath(RegisterNewDeviceConstants.base, {
        userNumber: userNumber.toString(),
      }),
      "_blank",
    )
  }, [setStatus, userNumber])

  const handleSendDelegate = React.useCallback(async () => {
    try {
      if (!signedDelegation) throw new Error("No signed delegation found")

      const parsedSignedDelegation = buildDelegate(signedDelegation)

      const protocol =
        FRONTEND_MODE === "development" ? "http:" : window.location.protocol
      const hostname = `${protocol}//${domain}`

      postClientAuthorizeSuccessMessage(appWindow, {
        parsedSignedDelegation,
        userKey: signedDelegation.userKey,
        hostname,
      })
    } catch (err) {
      console.error(">> not a valid delegate", { err })
    }
  }, [signedDelegation, domain, postClientAuthorizeSuccessMessage, appWindow])

  const handleLoginFromRemoteDelegation = React.useCallback(
    async (nfidJsonDelegate, userNumber) => {
      const loginResult = await IIConnection.loginFromRemoteFrontendDelegation({
        chain: JSON.stringify(nfidJsonDelegate.chain),
        sessionKey: JSON.stringify(nfidJsonDelegate.sessionKey),
        userNumber: BigInt(userNumber),
      })
      const result = apiResultToLoginResult(loginResult)

      if (result.tag === "ok") {
        setAuthenticatedActors(result)
      }
      // TODO: handle this more gracefully
      if (result.tag !== "ok") throw new Error("login failed")
    },
    [setAuthenticatedActors],
  )

  const handlePollForDelegate = React.useCallback(
    async (cancelPoll: () => void) => {
      const {
        body: [messages],
      } = await getMessages(pubKey)

      if (messages && messages.length > 0) {
        const parsedMessages = messages.map((m: string) => JSON.parse(m))
        const waitingMessage = parsedMessages.find(
          (m: { type: string }) => m.type === "remote-login-wait-for-user",
        )
        const registerMessage = parsedMessages.find(
          (m: { type: string }) => m.type === "remote-login-register",
        )

        if (registerMessage) {
          setUserNumber(BigInt(registerMessage.userNumber))
          setSignedDelegation({
            delegation: registerMessage.delegation,
            signature: registerMessage.signature,
            userKey: registerMessage.userKey,
          })

          handleLoginFromRemoteDelegation(
            registerMessage.nfid,
            registerMessage.userNumber,
          )

          setStatus("success")
          setShowRegister(true)
          cancelPoll()
        }

        if (waitingMessage) {
          setStatus("loading")
        }
      }
    },
    [
      getMessages,
      handleLoginFromRemoteDelegation,
      pubKey,
      setShowRegister,
      setStatus,
    ],
  )

  return {
    status,
    setStatus,
    url,
    pubKey,
    scope: domain,
    appWindow,
    userNumber,
    newDeviceKey,
    showRegister,
    setUserNumber,
    fromPath,
    setFromPath,
    setShowRegister,
    setNewDeviceKey,
    handleRegisterDevice,
    handleSendDelegate,
    postClientAuthorizeSuccessMessage,
    handleLoginFromRemoteDelegation,
    handlePollForDelegate,
    handleStoreNewDevice,
  }
}
