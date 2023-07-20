import React from "react"

import { getIsMobileDeviceMatch } from "frontend/integration/device"

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

  const [googleButtonWidth, setButtonWidth] = React.useState<
    number | undefined
  >()

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const width = buttonRef.current?.clientWidth
      console.debug("handleOnLoadContainer", { width })
      setButtonWidth(width)
    })
    return () => clearTimeout(timer)
  }, [])

  const onScriptLoadSuccess = React.useCallback(() => {
    window.google?.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: onLogin,
      itp_support: true,
    })
  }, [onLogin])

  useLoadGsiScript({ onScriptLoadSuccess })

  window.google?.accounts.id.renderButton(buttonRef.current, {
    width: googleButtonWidth?.toString() || "200",
    text: "continue_with",
    shape: "rectangular",
    theme: "outline",
    type: "standard",
    size: "large",
  })

  const onClick = React.useCallback(() => {
    let el: any
    if (getIsMobileDeviceMatch())
      el = buttonRef.current?.children[0].children[1].children[1]
    else el = buttonRef.current?.querySelector("div[role=button]")

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
