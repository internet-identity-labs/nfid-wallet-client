import clsx from "clsx"
import { useState } from "react"

import {
  Button,
  IconCmpWarning,
  IconSvgNFIDWalletLogo,
  ToggleButton,
} from "@nfid-frontend/ui"

import { RPCMessage } from "../type"
import { RPCComponentsUI } from "./methods/method"

export interface RPCComponentErrorProps {
  onRetry: () => void
  onCancel: () => void
  error?: Error
  request: MessageEvent<RPCMessage> | undefined
}

export const RPCComponentError = ({
  onRetry,
  onCancel,
  error,
  request,
}: RPCComponentErrorProps) => {
  const [isResponseTab, setIsResponseTab] = useState(true)

  const applicationName = new URL(String(request?.origin)).host

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex flex-col items-center mt-10 text-sm text-center">
        <img
          alt="NFID Wallet"
          className="w-[182px] mb-4"
          src={IconSvgNFIDWalletLogo}
        />

        <div className="block w-full text-lg font-bold mb-1.5">
          {request?.data.method}
        </div>
        <div className="block w-full text-sm">
          Request from{" "}
          <a
            href={origin}
            target="_blank"
            className="text-[#146F68] no-underline"
            rel="noreferrer"
          >
            {applicationName}
          </a>
        </div>
      </div>
      {request?.data.method !== RPCComponentsUI.icrc49_call_canister ? (
        <div className="flex flex-1 bg-orange-50 p-[15px] text-orange-900 gap-2.5 mt-10 rounded-xl">
          <div className="w-[22px] shrink-0">
            <IconCmpWarning className="!text-orange-900" />
          </div>
          <div className="w-full text-sm">
            <p className="mb-1 font-bold">Request failed</p>
            <p>{error?.message ?? "Unknown error"}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 mt-10">
          <ToggleButton
            firstValue={"Request"}
            secondValue={"Response"}
            onChange={setIsResponseTab}
            className="mb-5"
          />
          {isResponseTab ? (
            <div className="flex flex-1 bg-orange-50 p-[15px] text-orange-900 gap-2.5 rounded-xl">
              <div className="w-[22px] shrink-0">
                <IconCmpWarning className="!text-orange-900" />
              </div>
              <div className="w-full text-sm">
                <p className="mb-1 font-bold">Request failed</p>
                <p>{error?.message ?? "Unknown error"}</p>
              </div>
            </div>
          ) : (
            <div
              className={clsx(
                "rounded-md bg-gray-50 px-3.5 py-2.5 flex-1 space-y-4",
                "text-gray-500 break-all text-sm",
              )}
            >
              <div className="space-y-2">
                <p className="font-bold">Canister ID</p>
                <p className="">{(request.data?.params as any)?.canisterId}</p>
              </div>
              <div className="space-y-2">
                <p className="font-bold">Method</p>
                <p className="">{(request.data?.params as any)?.method}</p>
              </div>
              <div className="space-y-2">
                <p className="font-bold">Arg</p>
                <p className="">{(request.data?.params as any)?.arg}</p>
              </div>
            </div>
          )}
        </div>
      )}
      <div className={clsx("grid grid-cols-2 gap-5 mt-5 lg:mt-10")}>
        <Button type="stroke" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="primary" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  )
}
