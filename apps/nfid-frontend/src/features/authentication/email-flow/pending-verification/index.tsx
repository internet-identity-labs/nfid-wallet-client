import { Button, IconCmpArrow } from "@nfid-frontend/ui"

import { AuthAppMeta } from "frontend/features/authentication/ui/app-meta"

export interface AuthEmailFlowProps {
  email: string
  onBack: () => void
  onResend: () => void
}

export const AuthEmailPending: React.FC<AuthEmailFlowProps> = ({
  email,
  onBack,
  onResend,
}) => {
  return (
    <div className="w-full h-full text-sm text-center">
      <IconCmpArrow
        className="transition-opacity cursor-pointer hover:opacity-50"
        onClick={onBack}
      />
      <AuthAppMeta title="An email is on its way!" />
      <p className="font-bold">{email}</p>
      <p className="mt-6 leading-[22px]">
        An email was sent to this address. If this email address has an NFID
        account, you’ll find a magic link that will sign you in. You may need to
        check your spam folder if you don’t see it.
      </p>
      <p className="mt-8">Still can’t find the email?</p>
      <Button onClick={onResend} type="ghost">
        Resend email
      </Button>
    </div>
  )
}
