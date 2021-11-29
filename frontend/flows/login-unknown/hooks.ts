import { blobFromUint8Array, blobToHex } from "@dfinity/candid"
import React from "react"

const READY_MESSAGE = {
  kind: "authorize-ready",
}

type MessageKinds = "authorize-client" | "registered-device"

interface Message {
  kind: MessageKinds
}

interface UseMessageChannelProps {
  messageHandler: {
    [key in MessageKinds]: (event: any) => void
  }
}

export const useMessageChannel = ({
  messageHandler,
}: UseMessageChannelProps) => {
  const [opener, setOpener] = React.useState<Window | null>(null)

  const postClientReadyMessage = React.useCallback(() => {
    if (opener) return opener.postMessage(READY_MESSAGE, "*")
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

  const handleAuthMessage = React.useCallback(
    async (event: { data: Message }) => {
      const { kind } = event.data
      const eventHandler = messageHandler[kind]
      if (eventHandler && typeof eventHandler === "function") {
        return eventHandler(event)
      }
      console.warn(`Unknown message kind: ${kind}`)
    },
    [messageHandler],
  )

  const waitForOpener = React.useCallback(async () => {
    const maxTries = 5
    let interval: NodeJS.Timer
    let run: number = 0

    interval = setInterval(() => {
      if (run >= maxTries) {
        clearInterval(interval)
      }
      if (window.opener !== null) {
        setOpener(window.opener)
        clearInterval(interval)
      }
    }, 500)
  }, [])

  React.useEffect(() => {
    waitForOpener()
  }, [waitForOpener])

  React.useEffect(() => {
    window.addEventListener("message", handleAuthMessage)
    return () => window.removeEventListener("message", handleAuthMessage)
  }, [handleAuthMessage])

  return {
    isReady: opener !== null,
    opener,
    postClientReadyMessage,
    postClientAuthorizeSuccessMessage,
  }
}

export const useUnknownDeviceConfig = () => {
  const [appWindow, setAppWindow] = React.useState<Window | null>(null)
  const [domain, setDomain] = React.useState("")
  const [pubKey, setPubKey] = React.useState("")
  const [newDeviceKey, setNewDeviceKey] = React.useState<any | null>(null)

  const url = React.useMemo(() => {
    const multipassDomain = import.meta.env.VITE_MULTIPASS_DOMAIN

    console.log(`multipassDomain`, multipassDomain)
    
    // TODO: create custom hook to generate secret
    return domain && pubKey
      ? `https://${multipassDomain}/rdp/${pubKey}/${domain}`
      : null
  }, [domain, pubKey])

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
        "registered-device": (event: any) => {
          setNewDeviceKey(event.data.deviceKey)
        },
      },
    })

  React.useEffect(() => {
    isReady && postClientReadyMessage()
  }, [isReady, postClientReadyMessage])

  return {
    url,
    pubKey,
    scope: domain,
    appWindow,
    newDeviceKey,
    postClientAuthorizeSuccessMessage,
  }
}
