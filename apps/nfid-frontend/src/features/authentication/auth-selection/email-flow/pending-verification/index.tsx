import { Button, IconCmpArrow, IconCmpDoubleSpinner } from "@nfid-frontend/ui"

import { AuthAppMeta } from "frontend/features/authentication/ui/app-meta"

export interface AuthEmailFlowProps {
  email: string
  onBack: () => void
  onResend: () => void
  isIdentityKit?: boolean
}

export const AuthEmailPending: React.FC<AuthEmailFlowProps> = ({
  email,
  onBack,
  onResend,
  isIdentityKit,
}) => {
  return (
    <div className="flex flex-col flex-1 w-full h-full text-sm text-center">
      <IconCmpArrow
        className="absolute transition-opacity cursor-pointer left-5 top-5 hover:opacity-50"
        onClick={onBack}
      />
      <AuthAppMeta title="An email is on its way!" withLogo={!isIdentityKit} />
      <p className="text-sm">{email}</p>
      <p className="mt-6 leading-[22px]">
        An email was sent to this address. If this email address has an NFID
        account, you’ll find a magic link that will sign you in. You may need to
        check your spam folder if you don’t see it.
      </p>
      <p className="mt-8">Still can’t find the email?</p>
      <Button
        onClick={onResend}
        type="ghost"
        className="inline-block mx-auto mt-2"
      >
        Resend email
      </Button>
      <div className="flex-1" />
      <div className="absolute flex items-center justify-center space-x-1 text-gray-500 -translate-x-1/2 bottom-5 left-1/2 pr-[10%]">
        <IconCmpDoubleSpinner className="animate-spin" />
        <p className="text-sm">Checking for magic link verification</p>
      </div>
    </div>
  )
}
