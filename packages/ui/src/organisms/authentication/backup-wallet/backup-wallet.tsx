import clsx from "clsx"
import { FC } from "react"

import { Button } from "@nfid-frontend/ui"

import Image from "./backup-wallet.png"

export interface AuthBackupWalletProps {
  onSkip: () => void
  onCreate: () => void
  name?: string | number
  className?: string
  titleClassName?: string
}

export const AuthBackupWallet: FC<AuthBackupWalletProps> = ({
  onSkip,
  onCreate,
  name,
  className,
  titleClassName,
}) => {
  return (
    <div
      className={clsx(
        "flex flex-col flex-grow w-full min-h-[536px] text-sm text-center",
        className,
      )}
    >
      <h5
        className={clsx(
          "text-center font-bold mt-[50px] mb-0 text-[20px]",
          titleClassName,
        )}
      >
        Back up your wallet
      </h5>
      <p className="mt-2.5 mb-[30px]">NFID Wallet name: {name}</p>
      <p>
        This is the only way to recover your wallet if you lose your NFID Wallet
        number, password, or passkeys.
      </p>
      <img
        className="flex-1 my-auto max-h-[245px] object-contain"
        src={Image}
        alt="backup-img"
      />
      <Button className="mt-auto" block onClick={onCreate} type="primary">
        Create recovery phrase
      </Button>
      <Button className="mt-2.5" block onClick={onSkip} type="ghost">
        Skip for now
      </Button>
    </div>
  )
}
