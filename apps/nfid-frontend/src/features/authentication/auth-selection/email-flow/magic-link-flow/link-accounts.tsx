import { Button, IconCmpGoogle } from "@nfid-frontend/ui"

import { SignInWithGoogle } from "frontend/ui/atoms/button/signin-with-google"

import { AuthAppMeta } from "../../../ui/app-meta"
import LinkAsset from "../images/link-accounts.png"

export const EmailMagicLinkLink = ({
  onContinue,
}: {
  onContinue: (token: string) => void
}) => {
  return (
    <>
      <AuthAppMeta title="Link account" />
      <p className="text-sm text-center">
        This email address has previously been registered. Link your account
        with Google to access your account through either a sign in link or
        Google sign in.
      </p>
      <img src={LinkAsset} className="w-full h-56 my-10" />
      <SignInWithGoogle
        onLogin={(credential) => onContinue(credential.credential)}
        button={
          <Button
            className="h-12 !p-0"
            type="stroke"
            icon={<IconCmpGoogle />}
            block
          >
            Continue with Google
          </Button>
        }
      />
    </>
  )
}
