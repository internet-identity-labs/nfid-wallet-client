import clsx from "clsx"
import { useState } from "react"

import { IconCmpWarning, ToggleButton } from "@nfid-frontend/ui"

import { RPCMessage } from "../type"
import { CallCanisterDetails, renderArgs } from "./call-canisters/details"
import { RPCComponentsUI } from "./methods/method"
import { RPCPromptTemplate } from "./templates/prompt-template"

export interface RPCComponentErrorProps {
  onRetry: () => void
  onCancel: () => void
  error?: Error
  args?: string
  request: MessageEvent<RPCMessage> | undefined
}

export const RPCComponentError = ({
  onRetry,
  onCancel,
  error,
  args,
  request,
}: RPCComponentErrorProps) => {
  const [isResponseTab, setIsResponseTab] = useState(true)

  const applicationName = new URL(String(request?.origin)).host

  return (
    <RPCPromptTemplate
      title={request?.data?.params?.method ?? request?.data.method}
      subTitle={
        <>
          Request from{" "}
          <a
            href={origin}
            target="_blank"
            className="text-[#146F68] no-underline"
            rel="noreferrer"
          >
            {applicationName}
          </a>
        </>
      }
      primaryButtonText="Try again"
      secondaryButtonText="Cancel"
      onPrimaryButtonClick={onRetry}
      onSecondaryButtonClick={onCancel}
    >
      {request?.data.method !== RPCComponentsUI.icrc49_call_canister ? (
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
        <div className="flex flex-col flex-1">
          <ToggleButton
            firstValue={"Request"}
            secondValue={"Response"}
            defaultValue={true}
            onChange={setIsResponseTab}
            className="mb-5"
          />
          {isResponseTab ? (
            <div className="flex flex-1 border border-gray-200 p-[15px] text-orange-900 gap-2.5 rounded-xl overflow-auto">
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
                "rounded-xl border border-gray-200 px-3.5 py-2.5 flex-1 space-y-4",
                "text-gray-500 break-all text-sm overflow-auto max-h-[50vh]",
              )}
            >
              <div className="space-y-2">
                <p className="font-bold">Canister ID</p>
                <p className="">{(request.data?.params as any)?.canisterId}</p>
              </div>
              <div className="space-y-2">
                <p className="font-bold">Arguments</p>
                <div className="space-y-4">
                  {args ? (
                    renderArgs(JSON.parse(args)[0])
                  ) : (
                    <p className="">{(request.data?.params as any)?.arg}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {args && (
            <CallCanisterDetails
              canisterId={request?.data?.params?.canisterId}
              sender={request?.data?.params?.sender}
              args={String(args)}
            />
          )}
        </div>
      )}
    </RPCPromptTemplate>
  )
}
