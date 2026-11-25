import {
  Address,
  IconCmpArrow,
  IconNftPlaceholder,
  ImageWithFallback,
} from "@nfid-frontend/ui"

import { CanisterCallTitle } from "../../constants"
import { ICRC7TransferMetadata } from "../../service/canister-calls-helpers/interfaces"
import { RPCPromptTemplate } from "../templates/prompt-template"
import { CallCanisterDetails } from "./details"

export interface CallCanisterICRC37SpendingCapProps {
  origin: string
  canisterId: string
  args: string
  request: any
  metadata: ICRC7TransferMetadata
  onApprove: (data: any) => void
  onReject: () => void
}

const CallCanisterICRC37SpendingCap = ({
  origin,
  canisterId,
  args,
  request,
  metadata,
  onApprove,
  onReject,
}: CallCanisterICRC37SpendingCapProps) => {
  const applicationName = new URL(origin).host

  return (
    <RPCPromptTemplate
      title={CanisterCallTitle.icrc37_approve_tokens}
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
    >
      <div className="flex flex-col flex-1">
        <div className="flex items-center justify-between gap-3 pt-[3px] pb-[3px] pb-[3px] pr-[10px] border border-black dark:border-white rounded-[12px]">
          <ImageWithFallback
            alt={metadata.tokenName}
            src={metadata.tokenImage ?? metadata.collectionLogo ?? "#"}
            fallbackSrc={IconNftPlaceholder}
            className="w-[92px] h-[92px] rounded-[10px] object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate dark:text-white">
              {metadata.tokenName}
            </p>
            <p className="text-xs text-gray-400 truncate dark:text-zinc-500">
              {metadata.collectionName}
            </p>
          </div>
          <IconCmpArrow className="w-4 h-4 text-black rotate-180 shrink-0 dark:text-white" />
        </div>
        <div className="flex items-center justify-between h-[54px] text-sm dark:text-white mt-1">
          <span>To</span>
          <Address address={metadata.toAddress} />
        </div>
        <CallCanisterDetails
          canisterId={canisterId}
          sender={metadata.sender}
          args={args}
        />
      </div>
    </RPCPromptTemplate>
  )
}

export default CallCanisterICRC37SpendingCap
