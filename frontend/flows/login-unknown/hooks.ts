import { IIConnection } from "frontend/ii-utils/iiConnection"
import { blobFromHex, blobFromUint8Array, blobToHex } from "@dfinity/candid"
import React from "react"

const READY_MESSAGE = {
  kind: "authorize-ready",
}

type MessageKinds = "authorize-client"

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

  const url = React.useMemo(() => {
    const multipassDomain = import.meta.env.VITE_MULTIPASS_DOMAIN
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
    postClientAuthorizeSuccessMessage,
  }
}

interface UsePollforDelegateProps {
  pubKey: string
  onSuccess: (delegations: any) => void
}

// TODO:
// - [ ] add maxTries
// - [ ] add restart
export const usePollforDelegate = ({
  pubKey,
  onSuccess,
}: UsePollforDelegateProps) => {
  const fetchDelegate = React.useCallback(
    (stopInterval: () => void) => async () => {
      const {
        status_code,
        delegation: [delegate],
      } = await IIConnection.getDelegate(pubKey)
      if (status_code === 200 && delegate) {
        stopInterval()

        return onSuccess(delegate)
      }
    },
    [onSuccess, pubKey],
  )

  React.useEffect(() => {
    let interval: NodeJS.Timer
    interval = setInterval(
      fetchDelegate(() => clearInterval(interval)),
      2000,
    )
    return () => clearInterval(interval)
  }, [fetchDelegate])
}
