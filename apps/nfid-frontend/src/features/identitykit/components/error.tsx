import clsx from "clsx"
import { useState } from "react"

import { IconCmpWarning, ToggleButton } from "@nfid-frontend/ui"

import { CanisterCallTitle } from "../constants"
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
  title?: string
  consentMessage?: string
}

export const RPCComponentError = ({
  onRetry,
  onCancel,
  error,
  args,
  request,
  consentMessage,
}: RPCComponentErrorProps) => {
  const [isResponseTab, setIsResponseTab] = useState(true)

  const applicationName = new URL(String(request?.origin)).host

  const methodName = request?.data?.params?.method ?? request?.data.method

  return (
    <RPCPromptTemplate
      title={
        CanisterCallTitle[methodName as keyof typeof CanisterCallTitle] ??
        methodName
      }
      subTitle={
        <div className="dark:text-white">
          Request from{" "}
          <a
            href={origin}
            target="_blank"
            className="no-underline text-primaryButtonColor dark:text-teal-500"
            rel="noreferrer"
          >
            {applicationName}
          </a>
        </div>
      }
      primaryButtonText="Try again"
      secondaryButtonText="Cancel"
      onPrimaryButtonClick={onRetry}
      onSecondaryButtonClick={onCancel}
    >
      {request?.data.method !== RPCComponentsUI.icrc49_call_canister ? (
        <div className="flex bg-orange-50 dark:bg-orange-500/10 p-[15px] text-orange-900 dark:text-amber-600 gap-2.5 rounded-xl overflow-y-auto h-[240px]">
          <div className="w-[22px] shrink-0">
            <IconCmpWarning className="!text-orange-900 dark:!text-red-500" />
          </div>
          <div className="flex-1 min-w-0 text-sm">
            <p className="mb-1 font-bold dark:text-red-500">Request failed</p>
            <p className="dark:text-red-500">
              {error?.message ?? "Unknown error"}
            </p>
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
            <div className="flex border border-gray-200 dark:border-zinc-500 p-[15px] text-orange-900 gap-2.5 rounded-xl overflow-y-auto h-[240px]">
              <div className="w-[22px] shrink-0">
                <IconCmpWarning className="!text-orange-900 dark:!text-red-500" />
              </div>
              <div className="flex-1 min-w-0 text-sm">
                <p className="mb-1 font-bold dark:text-red-500">
                  Request failed
                </p>
                <p className="dark:text-red-500">
                  {error?.message ?? "Unknown error"}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div
                className={clsx(
                  "rounded-xl border border-gray-200 dark:border-zinc-500 px-3.5 py-2.5 h-[240px] overflow-y-auto space-y-4",
                  "text-gray-500 dark:text-zinc-500 break-all text-sm",
                )}
              >
                {consentMessage ? (
                  <>
                    <div className="space-y-2">
                      <p className="font-bold">Consent message</p>
                      <p className="leading-5 break-words whitespace-pre-wrap">
                        {consentMessage}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <p className="font-bold">Canister ID</p>
                      <p className="">
                        {(request.data?.params as any)?.canisterId}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold">Arguments</p>
                      <div
                        className={clsx(
                          "space-y-4 overflow-auto max-h-44",
                          "scrollbar scrollbar-w-4 scrollbar-thumb-gray-300",
                          "scrollbar-thumb-rounded-full scrollbar-track-rounded-full",
                        )}
                      >
                        {args ? (
                          renderArgs(JSON.parse(args)[0])
                        ) : (
                          <p className="">
                            {(request.data?.params as any)?.arg}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              {consentMessage && args && (
                <CallCanisterDetails
                  canisterId={request?.data?.params?.canisterId}
                  sender={request?.data?.params?.sender}
                  args={String(args)}
                />
              )}
            </>
          )}
        </div>
      )}
    </RPCPromptTemplate>
  )
}
