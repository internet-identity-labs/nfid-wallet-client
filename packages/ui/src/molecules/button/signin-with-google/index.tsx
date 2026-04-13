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

export const SignInWithGoogle: React.FC<SignInWithGoogleProps> = ({
  onLogin,
  button,
}) => {
  const buttonRef = React.useRef<HTMLDivElement>(null)

  const onLoginRef = React.useRef(onLogin)
  onLoginRef.current = onLogin

  const scriptLoadedSuccessfully = useLoadGsiScript()

  React.useEffect(() => {
    if (!scriptLoadedSuccessfully) return
    if (!GOOGLE_CLIENT_ID) return
    if (!window.google?.accounts?.id) return

    const w = window as unknown as { __nfidGsiInitialized?: boolean }

    // GSI warns if initialize() is called multiple times.
    if (!w.__nfidGsiInitialized) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (credential: CredentialResponse) =>
          onLoginRef.current(credential),
        itp_support: true,
        use_fedcm_for_prompt: true,
      })
      w.__nfidGsiInitialized = true
    }

    const parent = buttonRef.current
    if (!parent) return

    // Avoid re-rendering into the same parent on every render.
    if (parent.childNodes.length === 0) {
      window.google.accounts.id.renderButton(parent, {
        text: "continue_with",
        shape: "rectangular",
        theme: "outline",
        type: "standard",
        size: "large",
      })
    }
  }, [scriptLoadedSuccessfully])

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
