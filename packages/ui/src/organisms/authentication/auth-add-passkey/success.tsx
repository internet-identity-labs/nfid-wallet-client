import clsx from "clsx"
import { FC } from "react"

import { Button } from "@nfid/ui"

import Image from "./assets/passkey_enabled.webp"

export interface AuthAddPasskeyProps {
  onFinish: () => void
  name?: string | number
  titleClassName?: string
}

export const AuthAddPasskeySuccess: FC<AuthAddPasskeyProps> = ({
  onFinish,
  name,
  titleClassName,
}) => {
  return (
    <div className="flex flex-col w-full h-full text-sm text-center">
      <h5
        className={clsx(
          "text-center font-bold mt-[50px] mb-0 text-[20px]",
          titleClassName,
        )}
      >
        Biometric enabled
      </h5>
      <p className="mt-2.5 mb-[30px]">NFID Wallet name: {name}</p>
      <p className="text-center">
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
