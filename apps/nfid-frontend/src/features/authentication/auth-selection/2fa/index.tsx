import React from "react"

import { BlurredLoader, Button } from "@nfid-frontend/ui"
import { authenticationTracking } from "@nfid/integration"

import { useProfile } from "frontend/integration/identity-manager/queries"
import { AbstractAuthSession } from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"

import { AuthAppMeta } from "../../ui/app-meta"
import { passkeyConnector } from "../passkey-flow/services"
import Image2FA from "./2fa.png"

export interface IAuth2FA {
  appMeta?: AuthorizingAppMeta
  onSuccess: (authSession: AbstractAuthSession) => void
}
export const Auth2FA = ({ appMeta, onSuccess }: IAuth2FA) => {
  const { profile } = useProfile()
  const [isLoading, setIsLoading] = React.useState(false)

  const handleAuth = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await passkeyConnector.loginWithAllowedPasskey()
      authenticationTracking.initiated(
        {
          authLocation: "magic",
        },
        true,
      )
      onSuccess(res)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }, [onSuccess])

  if (isLoading) return <BlurredLoader isLoading />

  return (
    <>
      <AuthAppMeta
        applicationLogo={appMeta?.logo}
        applicationURL={appMeta?.url}
        applicationName={appMeta?.name}
        title="Two-factor authentication"
      />
      <p className="text-sm font-bold text-center">{profile?.email}</p>
      <p className="mt-3 text-sm text-center">
        Your account has been configured to use two-factor authentication. Use
        your passkey to confirm it’s you.
      </p>
      <img alt="asset" src={Image2FA} className="w-full h-56 my-10" />
      <Button className="mb-[30px]" onClick={handleAuth}>
        Continue
      </Button>
    </>
  )
}
