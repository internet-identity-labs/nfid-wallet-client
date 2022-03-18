import { IFrame } from "@identity-labs/ui"
import React from "react"

import useClickOutside from "../hooks/useClickOutside"

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

  return (
    <div ref={iframeRef}>
      <IFrame
        className="shadow-lg right-4 top-4 iframe"
        src={identityProvider}
        onLoad={handler}
      />
    </div>
  )
}
