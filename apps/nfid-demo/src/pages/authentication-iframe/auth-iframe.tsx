import React from "react"

import { IFrame } from "./components/iframe"
import { IFrameWrapper } from "./components/iframe-wrapper"

interface IAuthFrame {
  identityProvider: string
  authenticate: () => void
}
export const AuthIFrame = ({
  identityProvider,
  authenticate: handler,
}: IAuthFrame) => {
  const calledAuth = React.useRef(false)

  const handleCallOnce = React.useCallback(async () => {
    if (!calledAuth.current) {
      handler()
      calledAuth.current = true
    }
  }, [calledAuth, handler])

  return (
    <IFrameWrapper className="shadow-lg sm:right-4 top-4">
      <IFrame src={identityProvider} onLoad={handleCallOnce} />
    </IFrameWrapper>
  )
}
