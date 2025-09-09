import clsx from "clsx"

import { IconCmpWarning } from "@nfid-frontend/ui"
import { ICP_DECIMALS } from "@nfid/integration/token/constants"

import { DefaultMetadata } from "../../service/canister-calls-helpers/interfaces"
import { RPCPromptTemplate } from "../templates/prompt-template"
import { CallCanisterDetails } from "./details"

export interface CallCanisterLedgerTransferProps {
  origin: string
  canisterId: string
  consentMessage?: string
  methodName: string
  args: string
  request: any
  metadata: DefaultMetadata
  onApprove: (data: any) => void
  onReject: () => void
}

const CallCanisterLedgerTransfer = (props: CallCanisterLedgerTransferProps) => {
  const {
    origin,
    request,
    args,
    methodName,
    canisterId,
    consentMessage,
    onApprove,
    onReject,
    metadata,
  } = props

  const applicationName = new URL(origin).host

  return (
    <RPCPromptTemplate
      title={methodName}
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
      onPrimaryButtonClick={() => onApprove(request)}
      onSecondaryButtonClick={onReject}
      balance={{
        address: request?.data?.params?.sender,
        decimals: ICP_DECIMALS,
        symbol: "ICP",
        balance: metadata.balance,
      }}
    >
      <div
        className={clsx(
          "rounded-xl border border-gray-200 dark:border-zinc-500 px-3.5 py-2.5 h-[240px] overflow-y-auto space-y-4",
          "text-gray-500 dark:text-zinc-500 break-all text-sm mt-2.5",
          "overflow-auto",
        )}
      >
        {consentMessage ? (
          <div className="space-y-2">
            <p className="font-bold">Consent message</p>
            <p className="leading-5">{consentMessage}</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <p className="font-bold">Canister ID</p>
              <p className="">{canisterId}</p>
            </div>
            <div className="space-y-2">
              <p className="font-bold">Arguments</p>
              <p
                className={clsx(
                  "overflow-auto max-h-44",
                  "scrollbar scrollbar-w-4 scrollbar-thumb-gray-300",
                  "scrollbar-thumb-rounded-full scrollbar-track-rounded-full",
                )}
              >
                {args}
              </p>
            </div>
          </>
        )}
      </div>
      <div
        className={clsx(
          "grid grid-cols-[22px,1fr] gap-2.5 text-sm rounded-xl",
          "bg-orange-50 dark:bg-orange-500/10 p-[15px] mt-4 text-orange-900 dark:text-amber-600",
          consentMessage && consentMessage.length && "hidden",
        )}
      >
        <IconCmpWarning className="text-orange-900 dark:text-amber-600 w-[22px] h-[22px] shrink-1" />
        <p>
          <span className="font-bold leading-[20px]">
            Proceed with caution.
          </span>{" "}
          Unable to verify the safety of this approval. Please make sure you
          trust this dapp.
        </p>
      </div>
      {consentMessage && consentMessage.length && (
        <CallCanisterDetails
          canisterId={canisterId}
          sender={request?.data?.params?.sender}
          args={args}
        />
      )}
    </RPCPromptTemplate>
  )
}

export default CallCanisterLedgerTransfer
