import { FC } from "react"

import { Button } from "@nfid-frontend/ui"

import Image from "./assets/passkey_enabled.webp"

export interface AuthAddPasskeyProps {
  onFinish: () => void
  email?: string
}

export const AuthAddPasskeySuccess: FC<AuthAddPasskeyProps> = ({
  onFinish,
  email,
}) => {
  return (
    <div className="flex flex-col w-full h-full text-sm text-center">
      <p className="text-center font-bold mt-[30px] text-lg">
        Biometric enabled
      </p>
      <p className="mt-2.5 mb-[30px]">{email}</p>
      <p>
        You can now use your fingerprint, face, or screen lock to sign in faster
        and more securely next time.
      </p>
      <img
        className="flex-1 mt-5 max-h-[245px] object-contain"
        src={Image}
        alt="email-verification-error"
      />
      <Button className="mt-auto" block onClick={onFinish} type="primary">
        Done
      </Button>
    </div>
  )
}
