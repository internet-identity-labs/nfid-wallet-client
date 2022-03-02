import { PublicKey } from "@dfinity/agent"
import { blobFromHex, blobFromUint8Array, blobToHex } from "@dfinity/candid"
import { DelegationChain, Ed25519KeyIdentity } from "@dfinity/identity"
import { CONFIG } from "frontend/config"
import { RegisterDevicePromptConstants } from "frontend/flows/screens-app/register-device-prompt/routes"
import { RegisterNewDeviceConstants as RNDC } from "frontend/flows/screens-app/register-device/routes"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useMultipass } from "frontend/hooks/use-multipass"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"
import { apiResultToLoginResult } from "frontend/services/internet-identity/api-result-to-login-result"
import { buildDelegate } from "frontend/services/internet-identity/build-delegate"
import { IIConnection } from "frontend/services/internet-identity/iiConnection"
import { usePubSubChannel } from "frontend/services/pub-sub-channel/use-pub-sub-channel"
import { atom, useAtom } from "jotai"
import React from "react"
import { useMessageChannel } from "./use-message-channel"

type loadingState = "initial" | "loading" | "success"

export type nfidJsonDelegate = {
  chain: DelegationChain | undefined
  sessionKey: Ed25519KeyIdentity | undefined
}

export type signedDelegation = {
  delegation: {
    pubkey: PublicKey
    expiration: string
    targets: undefined
  }
  signature: number[]
  userKey: PublicKey
}

const registerAtom = atom<boolean>(false)
const loadingAtom = atom<loadingState>("initial")

export const useUnknownDeviceConfig = () => {
  const [status, setStatus] = useAtom(loadingAtom)
  const [showRegister, setShowRegister] = useAtom(registerAtom)

  const [userNumber, setUserNumber] = React.useState<bigint | undefined>(
    undefined,
  )
  const [nfidJsonDelegate, setNfidJsonDelegate] =
    React.useState<nfidJsonDelegate>()
  const [signedDelegation, setSignedDelegation] =
    React.useState<signedDelegation>()

  const [appWindow, setAppWindow] = React.useState<Window | null>(null)
  const [domain, setDomain] = React.useState("")
  const [pubKey, setPubKey] = React.useState("")
  const [newDeviceKey, setNewDeviceKey] = React.useState<any | null>(null)

  const { createDevice } = useDevices()
  const { applicationName } = useMultipass()
  const { getMessages } = usePubSubChannel()
  const { readAccount } = useAccount()
  const { identityManager, onRegisterSuccess: setAuthenticatedActors } =
    useAuthentication()

  const url = React.useMemo(() => {
    const multipassDomain = import.meta.env.VITE_MULTIPASS_DOMAIN

    // TODO: create custom hook to generate secret
    return domain && pubKey
      ? `https://${multipassDomain}${RegisterDevicePromptConstants.base}/${pubKey}/${domain}/${applicationName}`
      : null
  }, [applicationName, domain, pubKey])

  const { isReady, postClientReadyMessage, postClientAuthorizeSuccessMessage } =
    useMessageChannel({
      messageHandler: {
        "authorize-client": (event: any) => {
          const { sessionPublicKey } = event.data
          const blog = blobFromUint8Array(sessionPublicKey)
          const hex = blobToHex(blog)

          setAppWindow(event.source)
          setPubKey(hex)
          setDomain(new URL(event.origin).host)
        },
        "new-device": (event: any) => {
          handleStoreNewDevice(event.data)
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
    },
    [createDevice, userNumber],
  )

  React.useEffect(() => {
    isReady && postClientReadyMessage()
  }, [isReady, postClientReadyMessage])

  const handleRegisterDevice = React.useCallback(async () => {
    setStatus("loading")
    window.open(`${RNDC.base}/${pubKey}/${userNumber}`, "_blank")
    // const response = await handleAddDevice(BigInt(delegation.userNumber))
  }, [pubKey, setStatus, userNumber])

  const handleSendDelegate = React.useCallback(() => {
    try {
      if (!signedDelegation) throw new Error("No signed delegation found")

      const parsedSignedDelegation = buildDelegate(signedDelegation)
      const protocol =
        CONFIG.FRONTEND_MODE === "development"
          ? "http:"
          : window.location.protocol
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

  const handleLoginFromRemoteDelegation = React.useCallback(async () => {
    if (!nfidJsonDelegate || !userNumber)
      throw new Error("Missing delegate or userNumber")

    const loginResult = await IIConnection.loginFromRemoteFrontendDelegation({
      chain: JSON.stringify(nfidJsonDelegate.chain),
      sessionKey: JSON.stringify(nfidJsonDelegate.sessionKey),
      userNumber: userNumber,
    })
    const result = apiResultToLoginResult(loginResult)

    if (result.tag === "ok") {
      setAuthenticatedActors(result)
    }
    // TODO: handle this more gracefully
    if (result.tag !== "ok") throw new Error("login failed")
  }, [nfidJsonDelegate, setAuthenticatedActors, userNumber])

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
          setNfidJsonDelegate(registerMessage.nfid)
          setSignedDelegation(registerMessage.signedDelegate)
          handleLoginFromRemoteDelegation()

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

  const handleWaitForRegisteredDeviceKey = React.useCallback(async () => {
    if (!userNumber) throw new Error("No anchor found")

    const existingDevices = await IIConnection.lookupAll(userNumber)

    // TODO: fix the comparison
    const matchedDevice = existingDevices.find((deviceData) => {
      const existingDeviceString = deviceData.pubkey.toString()
      const newDeviceKeyString = blobFromHex(newDeviceKey).toString()

      existingDeviceString === newDeviceKeyString
    })

    await readAccount(identityManager)
    setStatus("success")
    handleSendDelegate()
    setNewDeviceKey(null)
  }, [
    handleSendDelegate,
    identityManager,
    newDeviceKey,
    readAccount,
    setStatus,
    userNumber,
  ])

  return {
    status,
    setStatus,
    url,
    pubKey,
    scope: domain,
    appWindow,
    newDeviceKey,
    showRegister,
    setUserNumber,
    setShowRegister,
    setNewDeviceKey,
    handleRegisterDevice,
    handleSendDelegate,
    postClientAuthorizeSuccessMessage,
    handleWaitForRegisteredDeviceKey,
    handleLoginFromRemoteDelegation,
    handlePollForDelegate,
  }
}
