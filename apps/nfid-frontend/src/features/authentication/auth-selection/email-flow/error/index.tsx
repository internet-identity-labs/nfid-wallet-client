import { Button, IconCmpArrow } from "@nfid-frontend/ui"

import Image from "./image.webp"

export interface AuthEmailErrorProps {
  onBack: () => void
  onResend: () => void
}

export const AuthEmailError: React.FC<AuthEmailErrorProps> = ({
  onBack,
  onResend,
}) => {
  return (
    <div className="flex flex-col w-full h-full text-sm text-center">
      <IconCmpArrow
        className="transition-opacity cursor-pointer hover:opacity-50 shrink-0"
        onClick={onBack}
      />
      <p className="text-center font-bold mt-[30px] text-lg">
        Something went wrong
      </p>
      <p className="mt-2.5">
        Magic link verification failed. Please try again.
      </p>
      <img className="flex-1 mt-5" src={Image} alt="email-verification-error" />

      <Button block onClick={onResend} type="primary">
        Resend email
      </Button>
    </div>
  )
}
