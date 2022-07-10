import React from "react"

import { usePostMessage } from "frontend/apps/identity-provider/use-post-message"
import { BuiltDelegate } from "frontend/integration/internet-identity/build-delegate"

const READY_MESSAGE = {
  kind: "authorize-ready",
}

type MessageKinds = "authorize-client" | "new-device"

interface Message {
  kind: MessageKinds
}

export interface MessageEvent {
  data: Message
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
    async (event: MessageEvent) => {
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
    (
      opener: Window,
      {
        parsedSignedDelegation,
        userKey,
        hostname,
      }: {
        userKey: number[]
        hostname: string
        parsedSignedDelegation: BuiltDelegate
      },
    ) => {
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
