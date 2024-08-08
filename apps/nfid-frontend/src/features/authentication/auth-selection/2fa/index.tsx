import React from "react"
import { toast } from "react-toastify"
import useSWR from "swr"

import { Button } from "@nfid-frontend/ui"
import { authenticationTracking } from "@nfid/integration"

import { fetchProfile } from "frontend/integration/identity-manager"
import { AbstractAuthSession } from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

import { AuthAppMeta } from "../../ui/app-meta"
import { passkeyConnector } from "../passkey-flow/services"
import Image2FA from "./2fa.png"

export interface IAuth2FA {
  appMeta?: AuthorizingAppMeta
  onSuccess: (authSession: AbstractAuthSession) => void
  allowedDevices?: string[]
}
export const Auth2FA = ({ appMeta, onSuccess, allowedDevices }: IAuth2FA) => {
  const { data: profile } = useSWR("profile", fetchProfile)
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    authenticationTracking.loaded2fa()
  }, [])

  const handleAuth = React.useCallback(async () => {
    setIsLoading(true)
    try {
      authenticationTracking.initiated(
        {
          authLocation: "magic",
          authSource: "passkey",
        },
        true,
      )
      const res = await passkeyConnector.loginWithAllowedPasskey(allowedDevices)
      onSuccess(res)
    } catch (e: any) {
      toast.error(e?.message ?? "Invalid Passkey")
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }, [allowedDevices, onSuccess])

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
        Your account has been configured for self-sovereign mode. Use your
        Passkey to confirm it’s you.
      </p>
      <img alt="asset" src={Image2FA} className="w-full h-56 my-10" />
      <Button className="mb-[30px]" onClick={handleAuth}>
        Continue
      </Button>
    </>
  )
}
