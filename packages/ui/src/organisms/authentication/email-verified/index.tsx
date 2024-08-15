import { AuthAppMeta } from "packages/ui/src/organisms/authentication/app-meta"
import React from "react"

import { Button } from "@nfid-frontend/ui"

import ImageVerified from "../images/verified.png"

export interface AuthEmailVerifiedProps {
  onContinue: () => void
}

export const AuthEmailVerified: React.FC<AuthEmailVerifiedProps> = ({
  onContinue,
}) => (
  <div className="flex flex-col flex-1 w-full h-full text-sm text-center">
    <AuthAppMeta title="Sign in verified" />
    <p>You may now continue to the application.</p>
    <img src={ImageVerified} className="w-full my-9" alt="verified" />
    <div className="flex-1"></div>
    <Button type="primary" block onClick={onContinue}>
      Continue
    </Button>
  </div>
)
