import clsx from "clsx"
import { CopyIcon } from "packages/ui/src/atoms/icons/copy"
import { FC, useState } from "react"

import { Button, Checkbox } from "@nfid-frontend/ui"

export interface AuthSaveRecoveryPhraseProps {
  onDone: () => void
  name?: string | number
  recoveryPhrase: string
  className?: string
  titleClassName?: string
}

export const AuthSaveRecoveryPhrase: FC<AuthSaveRecoveryPhraseProps> = ({
  onDone,
  name,
  recoveryPhrase,
  className,
  titleClassName,
}) => {
  const [checked, setChecked] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    if (copied) return
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 1000)
    navigator.clipboard.writeText(recoveryPhrase)
  }

  return (
    <div
      className={clsx(
        "flex flex-col w-full h-full flex-grow text-sm text-center dark:text-white",
        className,
      )}
    >
      <h5
        className={clsx(
          "text-center font-bold mt-[50px] mb-0 text-[20px]",
          titleClassName,
        )}
      >
        Save your recovery phrase
      </h5>
      <p className="mt-2.5 mb-[30px]">NFID Wallet name: {name}</p>
      <p>
        This recovery phrase restores your wallet in case your NFID Wallet
        number, password, or passkeys are lost. Keep this phrase secret, safe,
        and offline,
      </p>
      <div className="my-[10px] rounded-[12px] border border-black dark:border-zinc-500 flex flex-col">
        <div className="px-[10px] py-[10px] md:px-[14px] text-left h-[220px]">
          {recoveryPhrase}
        </div>
        <div
          className="mt-auto border-t border-black dark:border-zinc-500 h-[45px] flex justify-center items-center cursor-pointer"
          onClick={copyToClipboard}
        >
          <div className="flex text-sm font-bold">
            <CopyIcon className="text-black dark:text-white stroke-black mr-[8px]" />
            {copied ? "Copied" : "Copy"}
          </div>
        </div>
      </div>
      <div className="mb-[10px]">
        <Checkbox
          isChecked={checked}
          onChange={() => {
            setChecked(!checked)
          }}
          value=""
          id="save-phrase"
          labelClassName="!text-sm dark:text-white"
          labelText="I’ve saved this phrase in a safe place"
        />
      </div>
      <Button
        disabled={!checked}
        className="mt-auto"
        block
        onClick={onDone}
        type="primary"
      >
        Done
      </Button>
    </div>
  )
}
