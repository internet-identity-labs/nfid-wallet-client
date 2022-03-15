import React from "react"

import { usePostMessage } from "frontend/hooks/use-post-message"

const READY_MESSAGE = {
  kind: "authorize-ready",
}

type MessageKinds = "authorize-client" | "new-device"

interface Message {
  kind: MessageKinds
}

interface UseMessageChannelProps {
  messageHandler: {
    [key in MessageKinds]?: (event: any) => void | Promise<void>
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

  // FIXME: type def
  const { opener } = usePostMessage({ onMessage: handleAuthMessage as any })

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
