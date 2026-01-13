import clsx from "clsx"
import { FC } from "react"

import { BlurredLoader, Button } from "@nfid/ui"

import Image from "./assets/passkey.webp"

export interface AuthAddPasskeyProps {
  onSkip: () => void
  onAdd: () => void
  name?: string | number
  isLoading: boolean
  titleClassName?: string
}

export const AuthAddPasskey: FC<AuthAddPasskeyProps> = ({
  onSkip,
  onAdd,
  name,
  isLoading,
  titleClassName,
}) => {
  return (
    <BlurredLoader
      className="flex flex-col flex-grow w-full h-full"
      isLoading={isLoading}
      overlayClassnames="rounded-[24px]"
    >
      <div className="flex flex-col w-full h-full text-sm text-center dark:text-white">
        <h5
          className={clsx(
            "text-center font-bold mt-[50px] mb-0 text-[20px]",
            titleClassName,
          )}
        >
          Secure your wallet
        </h5>
        <p className="mt-2.5 mb-[30px]">NFID Wallet name: {name}</p>
        <p className="text-center">
          Adding biometric security will enable faster sign in and ensure you
          are the only one that can access your wallet.
        </p>
        <img
          className="flex-1 mt-5 max-h-[245px] object-contain"
          src={Image}
          alt="email-verification-error"
        />

        <Button className="mt-auto" block onClick={onAdd} type="primary">
          Continue
        </Button>
        <Button
          id={"skip-secure-wallet"}
          className="mt-2.5"
          block
          onClick={onSkip}
          type="ghost"
        >
          Skip for now
        </Button>
      </div>
    </BlurredLoader>
  )
}
