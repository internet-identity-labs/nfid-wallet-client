import clsx from "clsx"
import { FC } from "react"

import { BlurredLoader, Button } from "@nfid-frontend/ui"

import Image from "./assets/passkey.webp"

export interface AuthAddPasskeyProps {
  onSkip: () => void
  onAdd: () => void
  name?: string | number
  isLoading: boolean
  titleClassName?: string
}

export const AuthAddPasskey: FC<AuthAddPasskeyProps> = ({
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
      <div className="flex flex-col w-full h-full text-sm text-center">
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
          Starting <strong>July 1, 2025</strong>, signing in with Gmail or email
          based authentication will no longer be supported. Set up a passkey to
          ensure uninterrapted access.
        </p>
        <img
          className="flex-1 mt-5 max-h-[245px] object-contain"
          src={Image}
          alt="email-verification-error"
        />

        <Button className="mt-auto" block onClick={onAdd} type="primary">
          Continue
        </Button>
      </div>
    </BlurredLoader>
  )
}
