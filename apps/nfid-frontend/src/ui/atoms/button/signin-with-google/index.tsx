import React from "react"

import { getBrowser } from "frontend/ui/utils"

import { CredentialResponse } from "./types"
import useLoadGsiScript from "./useLoadGsiScript"

export type LoginEventHandler = ({ credential }: CredentialResponse) => void

if (!GOOGLE_CLIENT_ID) console.error("GOOGLE_CLIENT_ID is not defined")

interface SignInWithGoogleProps {
  onLogin: LoginEventHandler
  button?: JSX.Element
}

export const SignInWithGoogle: React.FC<SignInWithGoogleProps> = ({
  onLogin,
  button,
}) => {
  const buttonRef = React.useRef<HTMLDivElement>(null)

  const onScriptLoadSuccess = React.useCallback(() => {
    window.google?.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: onLogin,
      itp_support: true,
    })
  }, [onLogin])

  useLoadGsiScript({ onScriptLoadSuccess })

  window.google?.accounts.id.renderButton(buttonRef.current, {
    text: "continue_with",
    shape: "rectangular",
    theme: "outline",
    type: "standard",
    size: "large",
  })

  const onClick = React.useCallback(() => {
    let el: any
    if (getBrowser() === "Chrome") {
      el = buttonRef.current?.querySelector("div[role=button]")
    } else el = buttonRef.current?.children[0].children[1].children[1]

    //  @ts-ignore
    el?.click()
  }, [])

  return (
    <>
      <div ref={buttonRef} className="hidden" />
      <div className="w-full" onClick={onClick}>
        {button}
      </div>
    </>
  )
}
