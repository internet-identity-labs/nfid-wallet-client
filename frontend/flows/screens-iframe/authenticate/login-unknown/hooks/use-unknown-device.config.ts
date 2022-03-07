import { blobFromHex, blobFromUint8Array, blobToHex } from "@dfinity/candid"
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

const registerAtom = atom<boolean>(false)
const loadingAtom = atom<loadingState>("initial")

export const useUnknownDeviceConfig = () => {
  const [status, setStatus] = useAtom(loadingAtom)
  const [showRegister, setShowRegister] = useAtom(registerAtom)
  
  const [message, setMessage] = React.useState<any | null>(null)
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
      if (!message) throw new Error("No message")

      const { userNumber } = message

      setNewDeviceKey(device.publicKey)
      const response = await createDevice({
        ...device,
        userNumber: BigInt(userNumber),
      })
    },
    [createDevice, message],
  )

  React.useEffect(() => {
    isReady && postClientReadyMessage()
  }, [isReady, postClientReadyMessage])

  const handleRegisterDevice = React.useCallback(async () => {
    setStatus("loading")
    window.open(`${RNDC.base}/${pubKey}/${message.userNumber}`, "_blank")
    // const response = await handleAddDevice(BigInt(delegation.userNumber))
  }, [message?.userNumber, pubKey, setStatus])

  const handleSendDelegate = React.useCallback(
    (delegation) => {
      try {
        const parsedSignedDelegation = buildDelegate(delegation)
        const protocol =
          CONFIG.FRONTEND_MODE === "development"
            ? "http:"
            : window.location.protocol
        const hostname = `${protocol}//${domain}`

        postClientAuthorizeSuccessMessage(appWindow, {
          parsedSignedDelegation,
          userKey: delegation.userKey,
          hostname,
        })
      } catch (err) {
        console.error(">> not a valid delegate", { err })
      }
    },
    [appWindow, postClientAuthorizeSuccessMessage, domain],
  )

  const handleLoginFromRemoteDelegation = React.useCallback(
    async (registerMessage) => {
      const loginResult = await IIConnection.loginFromRemoteFrontendDelegation({
        chain: JSON.stringify(registerMessage.nfid.chain),
        sessionKey: JSON.stringify(registerMessage.nfid.sessionKey),
        userNumber: BigInt(registerMessage.userNumber),
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
        const parsedMessages = messages.map((m) => JSON.parse(m))
        const waitingMessage = parsedMessages.find(
          (m) => m.type === "remote-login-wait-for-user",
        )
        const registerMessage = parsedMessages.find(
          (m) => m.type === "remote-login-register",
        )

        if (registerMessage) {
          handleLoginFromRemoteDelegation(registerMessage)
          setMessage(registerMessage)

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
    const existingDevices = await IIConnection.lookupAll(
      BigInt(message.userNumber),
    )

    // TODO: fix the comparison
    const matchedDevice = existingDevices.find((deviceData) => {
      const existingDeviceString = deviceData.pubkey.toString()
      const newDeviceKeyString = blobFromHex(newDeviceKey).toString()

      existingDeviceString === newDeviceKeyString
    })

    await readAccount(identityManager)
    setStatus("success")
    handleSendDelegate(message)
    setNewDeviceKey(null)
  }, [
    handleSendDelegate,
    identityManager,
    message,
    newDeviceKey,
    readAccount,
    setNewDeviceKey,
    setStatus,
  ])

  return {
    status,
    setStatus,
    message,
    setMessage,
    url,
    pubKey,
    scope: domain,
    appWindow,
    newDeviceKey,
    showRegister,
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
