import React from "react"

import { CredentialResponse } from "./types"
import useLoadGsiScript from "./useLoadGsiScript"

export type LoginEventHandler = ({ credential }: CredentialResponse) => void

declare const GOOGLE_CLIENT_ID: string

if (!GOOGLE_CLIENT_ID) throw new Error("GOOGLE_CLIENT_ID is not defined")

interface SignInWithGoogleProps {
  onLogin: LoginEventHandler
}

export const SignInWithGoogle: React.FC<SignInWithGoogleProps> = ({
  onLogin,
}) => {
  const buttonRef = React.useRef<HTMLDivElement>(null)
  const isScriptLoaded = useLoadGsiScript()

  const googleButtonWidth = React.useMemo(() => {
    if (window.innerWidth > 500) return 400
    else return window.innerWidth - 40
  }, [])

  React.useEffect(() => {
    if (!isScriptLoaded) return

    window.google?.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: onLogin,
      itp_support: true,
    })

    window.google?.accounts.id.renderButton(buttonRef.current, {
      width: googleButtonWidth.toString(),
      text: "continue_with",
      shape: "rectangular",
      theme: "outline",
      type: "standard",
      size: "large",
    })
  }, [googleButtonWidth, isScriptLoaded, onLogin])

  return <div ref={buttonRef} />
}
