import { getBrowser } from "packages/utils/src"
import React from "react"

import { CredentialResponse } from "./types"
import useLoadGsiScript from "./useLoadGsiScript"

export type LoginEventHandler = ({ credential }: CredentialResponse) => void

if (!GOOGLE_CLIENT_ID) console.error("GOOGLE_CLIENT_ID is not defined")

interface SignInWithGoogleProps {
  onLogin: LoginEventHandler
  button?: JSX.Element
}

declare global {
  interface Window {
    __NFID_GSI_INITIALIZED__?: boolean
    __NFID_GSI_ON_LOGIN__?: LoginEventHandler
  }
}

const useFedcmForPrompt =
  typeof process !== "undefined" && process.env["NODE_ENV"] === "production"

export const SignInWithGoogle: React.FC<SignInWithGoogleProps> = ({
  onLogin,
  button,
}) => {
  const buttonRef = React.useRef<HTMLDivElement>(null)
  const onLoginRef = React.useRef(onLogin)
  onLoginRef.current = onLogin

  const scriptLoaded = useLoadGsiScript()

  React.useLayoutEffect(() => {
    if (!scriptLoaded || !GOOGLE_CLIENT_ID) return
    const host = buttonRef.current
    if (!host || !window.google?.accounts?.id) return

    window.__NFID_GSI_ON_LOGIN__ = (response: CredentialResponse) => {
      onLoginRef.current(response)
    }
    if (!window.__NFID_GSI_INITIALIZED__) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: CredentialResponse) =>
          window.__NFID_GSI_ON_LOGIN__?.(response),
        itp_support: true,
        use_fedcm_for_prompt: useFedcmForPrompt,
      })
      window.__NFID_GSI_INITIALIZED__ = true
    }

    host.replaceChildren()
    window.google.accounts.id.renderButton(host, {
      text: "continue_with",
      shape: "rectangular",
      theme: "outline",
      type: "standard",
      size: "large",
    })

    return () => {
      host.replaceChildren()
    }
  }, [scriptLoaded])

  const onClick = React.useCallback(() => {
    let el: HTMLElement | undefined
    if (getBrowser() === "Chrome") {
      el = buttonRef.current?.querySelector("div[role=button]") ?? undefined
    } else {
      const first = buttonRef.current?.children[0]?.children[1]?.children[1]
      el = first instanceof HTMLElement ? first : undefined
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
