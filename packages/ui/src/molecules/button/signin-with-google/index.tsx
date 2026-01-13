import { getBrowser } from "@nfid/utils"
import React from "react"

import { CredentialResponse } from "./types"
import useLoadGsiScript from "./useLoadGsiScript"

export type LoginEventHandler = ({ credential }: CredentialResponse) => void

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
      use_fedcm_for_prompt: true,
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
    let el: HTMLElement | null = null
    if (getBrowser() === "Chrome") {
      el = buttonRef.current?.querySelector("div[role=button]") as HTMLElement
    } else {
      const children = buttonRef.current?.children[0]?.children[1]
        ?.children[1] as HTMLElement
      el = children || null
    }

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
