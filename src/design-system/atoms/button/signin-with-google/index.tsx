import clsx from "clsx"
import React from "react"
import { Helmet } from "react-helmet-async"

import { useMutationObserver } from "frontend/hooks/use-mutation-observer"

import "./styles.css"

export type LoginEventHandler = ({ credential }: GoogleCredential) => void

declare const GOOGLE_CLIENT_ID: string

if (!GOOGLE_CLIENT_ID) console.error("GOOGLE_CLIENT_ID is not defined")

declare global {
  interface Window {
    handleLogin?: LoginEventHandler
  }
}

export interface GoogleCredential {
  clientId: string
  credential: string
  select_by: string
}

interface SignInWithGoogleProps {
  onLogin: LoginEventHandler
  buttonWidth?: number | null
}

export const SignInWithGoogle: React.FC<SignInWithGoogleProps> = ({
  onLogin,
  buttonWidth,
}) => {
  const [isOneTapVisible, setIsOneTapVisible] = React.useState(false)
  const [isReady, setIsReady] = React.useState(false)
  const googleButtonWidth = React.useMemo(() => {
    if (window.innerWidth > 500) return 400
    else return window.innerWidth - 40
  }, [])

  const oneTapRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    window.handleLogin = onLogin
    setIsReady(true)
    return () => {
      delete window.handleLogin
    }
  }, [onLogin])

  useMutationObserver(oneTapRef, (e: any) => {
    const value = e[0].target.clientHeight > 1
    setIsOneTapVisible(value)
  })

  return (
    <>
      <Helmet>
        <script
          src="https://accounts.google.com/gsi/client"
          async
          defer
        ></script>
      </Helmet>
      {isReady && (
        <>
          <div
            className={clsx("g_id_signin", isOneTapVisible && "hidden")}
            data-type="standard"
            data-size="large"
            data-theme="outline"
            data-text="continue_with"
            data-shape="rectangular"
            data-logo_alignment="left"
            data-width={googleButtonWidth}
          />
          <div
            ref={oneTapRef}
            id="g_id_onload"
            data-client_id={GOOGLE_CLIENT_ID}
            data-context="use"
            data-ux_mode="popup"
            data-callback="handleLogin"
            data-nonce=""
            data-prompt_parent_id="g_id_onload"
            data-close_on_tap_outside="false"
            style={{
              width: "100%",
              maxWidth: "416px",
            }}
          />
        </>
      )}
    </>
  )
}
