import { getBrowser } from "packages/utils/src"
import React, { useEffect } from "react"
import browser from "webextension-polyfill"

export type LoginEventHandler = (accessToken: string) => void

if (!GOOGLE_CLIENT_ID) console.error("GOOGLE_CLIENT_ID is not defined")

interface SignInWithGoogleProps {
  onLogin: LoginEventHandler
  button?: JSX.Element
}

// function loginChromium() {
//   const manifest = chrome.runtime.getManifest()
//   if (!manifest.oauth2?.scopes)
//     throw new Error("No OAuth2 scopes defined in the manifest file")

//   const url = new URL("https://accounts.google.com/o/oauth2/auth")

//   url.searchParams.set("client_id", manifest.oauth2.client_id)
//   url.searchParams.set("response_type", "id_token")
//   url.searchParams.set("access_type", "offline")
//   url.searchParams.set(
//     "redirect_uri",
//     `https://${chrome.runtime.id}.chromiumapp.org`,
//   )
//   url.searchParams.set("prompt", "select_account")
//   url.searchParams.set("scope", manifest.oauth2.scopes.join(" "))

//   return new Promise((resolve, reject) =>
//     chrome.identity.launchWebAuthFlow(
//       {
//         url: url.href,
//         interactive: true,
//       },
//       async (redirectedTo) => {
//         if (chrome.runtime.lastError) {
//           reject(`Could not login - ${chrome.runtime.lastError.message}`)
//         } else {
//           const urlObj = new URL(redirectedTo!)
//           const fragment = urlObj.hash.substring(1)
//           const params = new URLSearchParams(fragment)
//           const idToken = params.get("id_token")
//           resolve(idToken)
//         }
//       },
//     ),
//   )
// }

export const SignInWithGoogle: React.FC<SignInWithGoogleProps> = ({
  onLogin,
  button,
}) => {
  const buttonRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.google) {
      window.google?.accounts.id.initialize({
        client_id:
          "1089802819081-76qi2na9op8ke4isk3kuo30b2ga7gjqn.apps.googleusercontent.com",
        callback: ({ credential }) => onLogin(credential),
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

  const onClick = React.useCallback(async () => {
    let el: any
    if (getBrowser() === "Chrome") {
      const response = await browser.runtime.sendMessage<
        { action: string },
        { data: string }
      >({ action: "startOAuth" })
      onLogin(response.data)
      // loginChromium().then(onLogin as any)
    } else {
      el = buttonRef.current?.children[0].children[1].children[1]
      //  @ts-ignore
      el?.click()
    }
  }, [])

  return (
    <>
      <div style={{ display: "none" }} ref={buttonRef} className="hidden" />
      <div className="w-full" onClick={onClick}>
        {button}
      </div>
    </>
  )
}
