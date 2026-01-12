import { AuthAppMeta } from "packages/ui/src/organisms/authentication/app-meta"
import { useEffect } from "react"

import { Button } from "@nfid-frontend/ui"

import { useDarkTheme } from "frontend/hooks"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

import Image2FADark from "./2fa-dark.png"
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
  appMeta: _appMeta,
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
  }, [onMounted])
  const isDarkTheme = useDarkTheme()
  if (isLoading) return <BlurredLoader isLoading />

  return (
    <>
      <AuthAppMeta title="Passkey authentication" withLogo={!isIdentityKit} />
      {email && <p className="text-sm text-center">{email}</p>}
      <p className="mt-3 text-sm text-center dark:text-white">
        Your account has been configured for self-sovereign mode. Use your
        Passkey to confirm it’s you.
      </p>
      <img
        alt="asset"
        src={isDarkTheme ? Image2FADark : Image2FA}
        className="object-contain w-full h-56 my-10"
      />
      <Button className="mb-[30px] w-full" onClick={handleAuth}>
        Continue
      </Button>
    </>
  )
}
