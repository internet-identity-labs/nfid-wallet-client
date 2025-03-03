import { AuthAppMeta } from "packages/ui/src/organisms/authentication/app-meta"
import { useEffect } from "react"

import { Button } from "@nfid-frontend/ui"

import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

import Image2FA from "./2fa.png"

interface AuthorizingAppMeta {
  name?: string
  url?: string
  logo?: string
}

export interface IAuth2FA {
  appMeta?: AuthorizingAppMeta
  handleAuth: () => void
  isLoading: boolean
  onMounted?: () => void
  email?: string
  isIdentityKit?: boolean
}
export const Auth2FA = ({
  appMeta,
  isLoading,
  handleAuth,
  onMounted,
  email,
  isIdentityKit,
}: IAuth2FA) => {
  useEffect(() => {
    if (onMounted) {
      onMounted()
    }
  }, [])

  if (isLoading) return <BlurredLoader isLoading />

  return (
    <>
      <AuthAppMeta title="Passkey authentication" withLogo={!isIdentityKit} />
      {email && <p className="text-sm text-center">{email}</p>}
      <p className="mt-3 text-sm text-center">
        Your account has been configured for self-sovereign mode. Use your
        Passkey to confirm it’s you.
      </p>
      <img
        alt="asset"
        src={Image2FA}
        className="object-contain w-full h-56 my-10"
      />
      <Button className="mb-[30px] w-full" onClick={handleAuth}>
        Continue
      </Button>
    </>
  )
}
