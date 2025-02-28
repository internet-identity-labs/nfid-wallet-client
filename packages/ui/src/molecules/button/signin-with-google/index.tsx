import { getBrowser } from "packages/utils/src"
import React, { useEffect } from "react"

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
  useEffect(() => {
    if (window.google) {
      window.google?.accounts.id.initialize({
        client_id: "1089802819081-4b1af2vqmhfjqs40khcl7575qors9fj7.apps.googleusercontent.com",
        callback: onLogin,
        itp_support: true,
      })
      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          text: "continue_with",
          shape: "rectangular",
          theme: "outline",
          type: "standard",
          size: "large",
        })
      }
    }
  }, [onLogin, buttonRef])

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
