import { AuthAppMeta } from "@nfid/ui/organisms/authentication/app-meta"

import { Button, IconCmpArrow, IconCmpDoubleSpinner } from "@nfid/ui"

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
    <div className="flex flex-col flex-1 w-full h-full text-sm text-center dark:text-white">
      <IconCmpArrow
        className="absolute transition-opacity cursor-pointer left-5 lg:left-7 top-5 hover:opacity-50"
        onClick={onBack}
      />
      <AuthAppMeta title="An email is on its way!" withLogo={!isIdentityKit} />
      <p className="text-sm">{email}</p>
      <p className="mt-6 leading-[22px]">
        An email was sent to this address. If this email address has an NFID
        account, you’ll find a magic link that will sign you in. You may need to
        check your spam folder if you don’t see it.
      </p>
      <p className="mt-[30px]">Still can’t find the email?</p>
      <Button
        onClick={onResend}
        type="ghost"
        className="inline-block mx-auto mt-2"
      >
        Resend email
      </Button>
      <div className="flex items-center justify-center mt-auto space-x-1 text-gray-400 dark:text-zinc-500">
        <IconCmpDoubleSpinner className="animate-spin" />
        <p className="text-sm">Checking for magic link verification</p>
      </div>
    </div>
  )
}
