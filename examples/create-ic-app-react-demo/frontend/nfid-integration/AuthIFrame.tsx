import { IFrame } from "@identity-labs/ui"
import React from "react"

import useClickOutside from "../hooks/useClickOutside"
import { AuthContext } from "./AuthContext"

interface IAuthFrame {
  identityProvider: string
  handler: () => void
}
export const AuthIFrame = ({ identityProvider, handler }: IAuthFrame) => {
  const { setIsIframeOpened } = React.useContext(AuthContext)

  const iframeRef = useClickOutside(() => setIsIframeOpened(false))

  return (
    <div ref={iframeRef}>
      <IFrame
        className="right-0 shadow-lg sm:right-4 top-4 iframe"
        src={identityProvider}
        onLoad={handler}
      />
    </div>
  )
}
