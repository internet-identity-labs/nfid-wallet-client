import React, { useEffect, useRef } from "react"

if (!GOOGLE_CLIENT_ID) console.error("GOOGLE_CLIENT_ID is not defined")

interface SignInWithGoogleProps {
  onLogin: (credential: string) => void
  button: JSX.Element
}

export const SignInWithGoogle: React.FC<SignInWithGoogleProps> = ({
  onLogin,
  button,
}) => {
  const buttonRef = useRef<HTMLDivElement>(null)
  const onLoginRef = useRef(onLogin)
  onLoginRef.current = onLogin

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.onload = () => {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: ({ credential }) => onLoginRef.current(credential),
        itp_support: true,
        use_fedcm_for_prompt: true,
      })
      google.accounts.id.renderButton(buttonRef.current!, {
        text: "continue_with",
        shape: "rectangular",
        theme: "outline",
        type: "standard",
        size: "large",
      })
    }
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <>
      <div ref={buttonRef} className="hidden" />
      <div
        className="w-full"
        onClick={() =>
          buttonRef.current
            ?.querySelector<HTMLElement>("div[role=button]")
            ?.click()
        }
      >
        {button}
      </div>
    </>
  )
}
