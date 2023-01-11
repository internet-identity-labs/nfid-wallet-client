import React from "react"

import { useClickOutside } from "@nfid-frontend/ui"

import { IFrame } from "./components/iframe"

interface IAuthFrame {
  identityProvider: string
  handler: () => void
  onClose: () => void
}
export const AuthIFrame = ({
  identityProvider,
  handler,
  onClose,
}: IAuthFrame) => {
  const iframeRef = useClickOutside(onClose)
  const calledAuth = React.useRef(false)

  const handleCallOnce = React.useCallback(async () => {
    if (!calledAuth.current) {
      handler()
      calledAuth.current = true
      console.log(">> handleCallOnce")
    }
  }, [calledAuth, handler])

  return (
    <div ref={iframeRef}>
      <IFrame
        className="right-0 shadow-lg sm:right-4 top-4 iframe"
        src={identityProvider}
        onLoad={handleCallOnce}
      />
    </div>
  )
}
