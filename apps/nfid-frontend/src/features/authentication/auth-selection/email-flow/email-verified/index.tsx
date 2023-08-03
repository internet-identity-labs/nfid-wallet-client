import React from "react"

import { Button } from "@nfid-frontend/ui"
import { RootWallet, authenticationTracking } from "@nfid/integration"

import { AuthAppMeta } from "frontend/features/authentication/ui/app-meta"
import { useProfile } from "frontend/integration/identity-manager/queries"

import ImageVerified from "../images/verified.png"

export interface AuthEmailVerifiedProps {
  onContinue: () => void
}

export const AuthEmailVerified: React.FC<AuthEmailVerifiedProps> = ({
  onContinue,
}) => {
  const { profile, isLoading } = useProfile()

  React.useEffect(() => {
    if (!isLoading && profile && !profile.is2fa) {
      authenticationTracking.completed({
        anchor: profile.anchor,
        legacyUser: profile.wallet === RootWallet.II,
        hasEmail: true,
      })
    }
  }, [profile, isLoading])

  return (
    <div className="w-full h-full text-sm text-center">
      <AuthAppMeta title="Sign in verified" />
      <p>You may now continue to the application.</p>
      <img src={ImageVerified} className="w-full h-56 my-9" alt="verified" />
      <Button type="primary" block onClick={onContinue}>
        Continue
      </Button>
    </div>
  )
}
