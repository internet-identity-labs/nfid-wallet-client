import clsx from "clsx"
import { FC } from "react"

import { BlurredLoader, Button } from "@nfid-frontend/ui"

import Image from "./assets/passkey.webp"

export interface AuthAddPasskeyProps {
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
    <>
      <div className="flex flex-col w-full h-full text-sm text-center dark:text-white">
        <div
          className={clsx(
            "text-center !font-bold mt-[50px] mb-0 text-[20px]",
            titleClassName,
          )}
        >
          Secure your wallet
        </div>
        <p className="mt-2.5 mb-[30px]">NFID Wallet name: {name}</p>
        <p className="text-center tracking-[0.1px]">
          Adding biometric security will enable faster sign in and ensure you
          are the only one that can access your wallet.
        </p>
        <img
          className="flex-1 my-[50px] max-h-[245px] object-contain"
          src={Image}
          alt="email-verification-error"
        />

        <Button className="mt-auto" block onClick={onAdd} type="primary">
          Create passkey
        </Button>
      </div>
      <BlurredLoader
        className="w-full h-full"
        isLoading={isLoading}
        overlayClassnames="rounded-[24px]"
      />
    </>
  )
}
