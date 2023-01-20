import React from "react"
import { useForm } from "react-hook-form"

import ArrowBackIcon from "../../assets/arrow-back.svg"
import { Button } from "../../molecules/button"
import { Input } from "../../molecules/input"
import { SDKApplicationMeta } from "../../molecules/sdk-app-meta"

export interface AuthConnectIIProps {
  onBack: () => void
  onRecovery: () => void
  onCreateAnchor: () => void
  onConnect: (anchor: number) => void
}

export const IIAuthConnect: React.FC<AuthConnectIIProps> = ({
  onBack,
  onRecovery,
  onCreateAnchor,
  onConnect,
}) => {
  const { register, getValues, watch } = useForm<{ anchor: number }>({
    mode: "all",
  })

  const anchor = watch("anchor")

  return (
    <div>
      <div className="flex space-x-2">
        <img
          className="cursor-pointer"
          src={ArrowBackIcon}
          alt="back"
          onClick={onBack}
        />
        <p className="text-lg font-bold">Connect Internet Identity</p>
      </div>
      <p className="mt-3 text-sm">
        By connecting, your NFID Wallet will sign you in to the same accounts as
        II, plus:
      </p>
      <ul className="mt-1 text-sm leading-6 list-disc ml-7">
        <li>Buy, store, send, and swap tokens</li>
        <li>Manage all your ICP wallets</li>
        <li>Own and share your data across dapps</li>
      </ul>

      <Input
        className="mt-3"
        labelText="Your Internet Identity anchor"
        placeholder="123456"
        type="number"
        {...register("anchor")}
      />
      <Button
        type="primary"
        block
        className="mt-2"
        onClick={() => onConnect(getValues("anchor"))}
        disabled={!anchor?.toString().length}
      >
        Connect
      </Button>
      <Button type="ghost" block onClick={onRecovery} className="font-normal">
        Connect with recovery phrase
      </Button>
      <Button
        type="ghost"
        block
        onClick={onCreateAnchor}
        className="font-normal"
      >
        Create a new anchor
      </Button>
    </div>
  )
}
