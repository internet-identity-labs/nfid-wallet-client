import clsx from "clsx"

import { IconCmpWarning } from "@nfid-frontend/ui"

import { RPCPromptTemplate } from "../templates/prompt-template"

export interface IRPCComponentICRC49 {
  origin: string
  canisterId: string
  consentMessage?: string
  method: string
  args: string
  request: any
  onApprove: (data: any) => void
  onReject: () => void
}

const RPCComponentICRC49 = ({
  origin,
  request,
  consentMessage,
  canisterId,
  method,
  args,
  onApprove,
  onReject,
}: IRPCComponentICRC49) => {
  const applicationName = new URL(origin).host

  return (
    <RPCPromptTemplate
      title={method}
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
      onApprove={() => onApprove(request)}
      onReject={onReject}
    >
      <div
        className={clsx(
          "rounded-md bg-gray-50 px-3.5 py-2.5 flex-1 space-y-4",
          "text-gray-500 break-all text-sm mt-2.5",
        )}
      >
        <div className="space-y-2">
          <p className="font-bold">Canister ID</p>
          <p className="">{canisterId}</p>
        </div>
        {consentMessage && (
          <div className="space-y-2">
            <p className="font-bold">Consent message</p>
            <p className="leading-5">{consentMessage}</p>
          </div>
        )}
        <div className="space-y-2">
          <p className="font-bold">Arguments</p>
          <p className="">{args}</p>
        </div>
      </div>
      <div
        className={clsx(
          "grid grid-cols-[22px,1fr] space-x-1.5 text-sm rounded-md",
          "bg-orange-50 p-[15px] mt-4 text-orange-900",
          consentMessage && consentMessage.length && "hidden",
        )}
      >
        <div>
          <IconCmpWarning className="text-orange-900 h-[22px]" />
        </div>
        <div>
          <p className="font-bold leading-[20px]">Approval not recommended</p>
          <p className="mt-0.5">
            Unable to verify the safety of this approval. Please make sure you
            trust this dapp.
          </p>
        </div>
      </div>
    </RPCPromptTemplate>
  )
}

export default RPCComponentICRC49
