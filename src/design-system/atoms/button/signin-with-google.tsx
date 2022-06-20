import React from "react"
import { Helmet } from "react-helmet-async"

export type LoginEventHandler = ({ credential }: GoogleCredential) => void

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
}

export const SignInWithGoogle: React.FC<SignInWithGoogleProps> = ({
  onLogin,
}) => {
  React.useEffect(() => {
    window.handleLogin = onLogin
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
      <div
        id="g_id_onload"
        data-client_id="339872286671-87oou3adnvl7hst9gd90r9k7j6enl7vk.apps.googleusercontent.com"
        data-context="signin"
        data-ux_mode="popup"
        data-callback="handleLogin"
        data-auto_prompt="false"
      ></div>

      <div
        className="g_id_signin"
        data-type="standard"
        data-shape="pill"
        data-theme="outline"
        data-text="signin_with"
        data-size="large"
        data-logo_alignment="left"
      ></div>
    </div>
  )
}
