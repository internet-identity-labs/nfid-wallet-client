import React from "react"
import { useForm } from "react-hook-form"

import ArrowBackIcon from "../../assets/arrow-back.svg"
import { Button } from "../../atoms/button"
import { Input } from "../../atoms/input"

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
        <p className="font-bold">Connect Internet Identity</p>
      </div>
      <p className="mt-4 text-sm ">
        By connecting, you will sign in to IC dapps with the same accounts as
        your Internet Identity, and take advantage of all of NFID’s current and
        upcoming features:
      </p>
      <ul className="mt-2 text-sm leading-6 list-disc ml-7">
        <li>Buy, store, send, and swap tokens</li>
        <li>Manage all your ICP wallets</li>
        <li>Own and share your data across dapps</li>
        <li>Prove to dapps you’re a unique human</li>
      </ul>

      <Input
        className="mt-5"
        labelText="Your Internet Identity anchor"
        placeholder="123456"
        type="number"
        {...register("anchor")}
      />
      <Button
        primary
        block
        className="mb-1"
        onClick={() => onConnect(getValues("anchor"))}
        disabled={!anchor?.toString().length}
      >
        Connect
      </Button>
      <Button text block onClick={onRecovery}>
        Connect with recovery phrase
      </Button>
      <Button text block onClick={onCreateAnchor}>
        Create a new anchor
      </Button>
    </div>
  )
}
