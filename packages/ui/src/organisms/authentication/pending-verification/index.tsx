import { AuthAppMeta } from "packages/ui/src/organisms/authentication/app-meta"

import { Button, IconCmpArrow, IconCmpDoubleSpinner } from "@nfid-frontend/ui"

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
    <div className="flex flex-col flex-1 w-full h-full text-sm text-center relative">
      <IconCmpArrow
        className="transition-opacity cursor-pointer hover:opacity-50 absolute top-0 left-0"
        onClick={onBack}
      />
      <AuthAppMeta title="An email is on its way!" />
      <p className="text-sm mt-[4px] leading-[22px]">{email}</p>
      <p className="mt-[83px] leading-[22px]">
        An email was sent to this address. If this email address has an NFID
        account, you’ll find a magic link that will sign you in. You may need to
        check your spam folder if you don’t see it.
      </p>
      <p className="mt-[30px]">Still can’t find the email?</p>
      <Button onClick={onResend} type="ghost" className="mt-2">
        Resend email
      </Button>
      <div className="flex items-center justify-center space-x-1 text-gray-400 mt-auto">
        <IconCmpDoubleSpinner className="animate-spin" />
        <p className="text-sm">Checking for magic link verification</p>
      </div>
    </div>
  )
}
