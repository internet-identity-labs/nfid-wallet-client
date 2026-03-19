import { AuthAppMeta } from "packages/ui/src/organisms/authentication/app-meta"

import {
  Button,
  IconCmpArrow,
  IconCmpDoubleSpinner,
  IconCmpInfo,
  Tooltip,
} from "@nfid-frontend/ui"

export interface AuthEmailFlowProps {
  email: string
  onBack: () => void
  onResend: () => void
  isIdentityKit?: boolean
  antiPhishingCode?: string
}

export const AuthEmailPending: React.FC<AuthEmailFlowProps> = ({
  email,
  onBack,
  onResend,
  isIdentityKit,
  antiPhishingCode,
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
      {antiPhishingCode && (
        <div className="mt-4 mx-auto w-full max-w-xs rounded-xl px-4 py-3 bg-orange-50 dark:bg-orange-500/10">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-900 dark:text-amber-600">
              Anti-phishing code
            </p>
            <Tooltip tip="Verify this code matches the one in your email before clicking any links.">
              <IconCmpInfo className="cursor-pointer w-3.5 h-3.5 shrink-0 text-orange-900 dark:text-amber-600" />
            </Tooltip>
          </div>
          <p className="font-mono font-bold tracking-widest text-xl text-orange-900 dark:text-amber-600 text-center">
            {antiPhishingCode}
          </p>
        </div>
      )}
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
