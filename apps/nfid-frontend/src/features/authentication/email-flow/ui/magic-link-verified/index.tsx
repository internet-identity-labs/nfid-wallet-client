import { Button } from "@nfid-frontend/ui"

import { AuthAppMeta } from "frontend/features/authentication/ui/app-meta"

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
      <div className="w-full h-56 bg-gray-100 my-9" />
      <Button type="primary" onClick={onContinue}>
        Continue
      </Button>
    </div>
  )
}
