import { blobFromUint8Array, blobToHex } from "@dfinity/candid"
import { RegisterDevicePromptConstants as RDPC } from "frontend/flows/screens-app/register-device/routes"
import { useMultipass } from "frontend/hooks/use-multipass"
import { usePostMessage } from "frontend/hooks/use-post-message"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"
import React from "react"

const READY_MESSAGE = {
  kind: "authorize-ready",
}

type MessageKinds = "authorize-client" | "new-device"

interface Message {
  kind: MessageKinds
}

interface UseMessageChannelProps {
  messageHandler: {
    [key in MessageKinds]?: (event: any) => void
  }
}

export const useMessageChannel = ({
  messageHandler,
}: UseMessageChannelProps) => {
  const handleAuthMessage = React.useCallback(
    async (event: { data: Message }) => {
      const { kind } = event.data
      const eventHandler = messageHandler[kind]
      if (eventHandler && typeof eventHandler === "function") {
        return eventHandler(event)
      }
      console.warn(`Unknown message kind: ${kind}`, { data: event.data })
    },
    [messageHandler],
  )

  const { opener } = usePostMessage({ onMessage: <any>handleAuthMessage })

  const postClientReadyMessage = React.useCallback(() => {
    if (opener)
      return opener.postMessage(
        {
          ...READY_MESSAGE,
          height: window.document.body.clientHeight,
        },
        "*",
      )
    throw new Error("opener not ready")
  }, [opener])

  const postClientAuthorizeSuccessMessage = React.useCallback(
    (opener, { parsedSignedDelegation, userKey, hostname }) => {
      opener.postMessage(
        {
          kind: "authorize-client-success",
          delegations: [parsedSignedDelegation],
          userPublicKey: Uint8Array.from(userKey),
        },
        hostname,
      )
    },
    [],
  )

  return {
    isReady: opener !== null,
    opener,
    postClientReadyMessage,
    postClientAuthorizeSuccessMessage,
  }
}

export const useUnknownDeviceConfig = () => {
  const [status, setStatus] = React.useState<"initial" | "loading" | "success">(
    "initial",
  )
  const [message, setMessage] = React.useState<any | null>(null)
  const [appWindow, setAppWindow] = React.useState<Window | null>(null)
  const [domain, setDomain] = React.useState("")
  const [pubKey, setPubKey] = React.useState("")
  const [newDeviceKey, setNewDeviceKey] = React.useState<any | null>(null)
  const { createDevice } = useDevices()
  const { applicationName } = useMultipass()

  const url = React.useMemo(() => {
    const multipassDomain = import.meta.env.VITE_MULTIPASS_DOMAIN

    // TODO: create custom hook to generate secret
    return domain && pubKey
      ? `https://${multipassDomain}${RDPC.base}/${pubKey}/${domain}/${applicationName}`
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
    setNewDeviceKey,
    postClientAuthorizeSuccessMessage,
  }
}
