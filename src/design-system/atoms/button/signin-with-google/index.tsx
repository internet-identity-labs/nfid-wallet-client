import React from "react"
import { Helmet } from "react-helmet-async"

import { useDeviceInfo } from "frontend/hooks/use-device-info"

import "./styles.css"

export type LoginEventHandler = ({ credential }: GoogleCredential) => void

const GOOGLE_CLIENT_ID: string =
  "339872286671-87oou3adnvl7hst9gd90r9k7j6enl7vk.apps.googleusercontent.com"

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
  const [isReady, setIsReady] = React.useState(false)
  const { isMobile } = useDeviceInfo()

  React.useEffect(() => {
    window.handleLogin = onLogin
    setIsReady(true)
    return () => {
      delete window.handleLogin
    }
  }, [onLogin])

  return (
    <div>
      <Helmet>
        <script
          src="https://accounts.google.com/gsi/client"
          async
          defer
        ></script>
      </Helmet>
      {/* <div
        id="g_id_onload"
        data-client_id="339872286671-87oou3adnvl7hst9gd90r9k7j6enl7vk.apps.googleusercontent.com"
        data-context="use"
        data-ux_mode="redirect"
        data-login_uri="https://ia15v0pzlb.execute-api.us-east-1.amazonaws.com/dev/googlecallback"
        data-auto_prompt="false"
      />
      */}
      {/* <div
        className="g_id_signin"
        data-type="standard"
        data-shape="rectangular"
        data-theme="outline"
        data-text="signin_with"
        data-size="large"
        data-logo_alignment="left"
      /> */}
      {/* <div
        id="g_id_onload"
        data-client_id="339872286671-87oou3adnvl7hst9gd90r9k7j6enl7vk.apps.googleusercontent.com"
        data-context="use"
        data-ux_mode="redirect"
        data-login_uri="https://ia15v0pzlb.execute-api.us-east-1.amazonaws.com/dev/googlecallback"
        data-auto_prompt="false"
      /> */}
      <div
        className="g_id_signin"
        data-type="standard"
        data-size="large"
        data-theme="outline"
        data-text="continue_with"
        data-shape="rectangular"
        data-logo_alignment="left"
        data-width={isMobile ? buttonWidth : "400"}
      ></div>
      {isReady && (
        <div
          id="g_id_onload"
          data-client_id={GOOGLE_CLIENT_ID}
          data-context="use"
          data-ux_mode="popup"
          data-callback="handleLogin"
          data-nonce=""
          data-prompt_parent_id="g_id_onload"
          style={{
            width: isMobile ? buttonWidth ?? "" : "416px",
            position: "absolute",
            marginLeft: "-8px",
            background: "red",
          }}
        ></div>
      )}
    </div>
  )
}
