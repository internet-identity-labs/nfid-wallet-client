import { blobFromHex, blobFromUint8Array, blobToHex } from "@dfinity/candid"
import { IIConnection } from "frontend/ii-utils/iiConnection"
import { Centered } from "frontend/ui-utils/atoms/centered"
import { QRCode } from "frontend/ui-utils/atoms/qrcode"
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

const useMessageChannel = ({ messageHandler }: UseMessageChannelProps) => {
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

const useUnknownDeviceConfig = () => {
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

  const fetchDelegate = React.useCallback(async () => {
    const {
      status_code,
      delegation: [delegate],
    } = await IIConnection.getDelegate(pubKey)
    if (status_code === 200 && delegate) {
      const receivedDelegation = JSON.parse(delegate)
      const parsedSignedDelegation = {
        delegation: {
          pubkey: Uint8Array.from(receivedDelegation.delegation.pubkey),
          expiration: BigInt(receivedDelegation.delegation.expiration),
          targets: undefined,
        },
        signature: Uint8Array.from(receivedDelegation.signature),
      }

      postClientAuthorizeSuccessMessage(appWindow, {
        parsedSignedDelegation,
        userKey: receivedDelegation.userKey,
        // TODO: handle protocol correctly
        hostname: `http://${domain}`,
      })
    }
  }, [appWindow, domain, postClientAuthorizeSuccessMessage, pubKey])

  React.useEffect(() => {
    isReady && postClientReadyMessage()
  }, [isReady, postClientReadyMessage])

  return { url, scope: domain, fetchDelegate }
}

export const UnknownDeviceScreen: React.FC = () => {
  const { url, scope, fetchDelegate } = useUnknownDeviceConfig()

  return (
    <Centered>
      <div className="font-medium mb-3">Sign in to {scope} with Multipass</div>
      {url ? (
        <div onClick={fetchDelegate} className="flex flex-row">
          <div className="mr-2">Scan code to login</div>
          <QRCode content={url} options={{ margin: 0 }} />
        </div>
      ) : null}
    </Centered>
  )
}
