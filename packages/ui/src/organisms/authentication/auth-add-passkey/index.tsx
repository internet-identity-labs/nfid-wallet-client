import { FC } from "react"

import { BlurredLoader, Button } from "@nfid-frontend/ui"

import Image from "./assets/add-passkey.svg"

export interface AuthAddPasskeyProps {
  onSkip: () => void
  onAdd: () => void
  email?: string
  isLoading: boolean
}

export const AuthAddPasskey: FC<AuthAddPasskeyProps> = ({
  onSkip,
  onAdd,
  email,
  isLoading,
}) => {
  return (
    <BlurredLoader isLoading={isLoading} overlayClassnames="rounded-[24px]">
      <div className="flex flex-col w-full h-full text-sm text-center">
        <p className="text-center font-bold mt-[30px] text-lg">
          Secure your wallet
        </p>
        <p className="mt-2.5 mb-[30px]">{email}</p>
        <p>
          Adding biometric security will enable faster sign in and ensure <br />
          you are the only one that can access your wallet.
        </p>
        <img
          className="flex-1 mt-5 max-h-[245px] object-contain"
          src={Image}
          alt="email-verification-error"
        />

        <Button className="mt-auto" block onClick={onAdd} type="primary">
          Continue
        </Button>
        <Button className="mt-2.5" block onClick={onSkip} type="ghost">
          Skip for now
        </Button>
      </div>
    </BlurredLoader>
  )
}
