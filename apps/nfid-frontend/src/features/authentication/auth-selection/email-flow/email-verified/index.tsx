import { Button } from "@nfid-frontend/ui"

import { AuthAppMeta } from "frontend/features/authentication/ui/app-meta"

import ImageVerified from "../images/verified.png"

export interface AuthEmailVerifiedProps {
  onContinue: () => void
}

export const AuthEmailVerified: React.FC<AuthEmailVerifiedProps> = ({
  onContinue,
}) => {
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
