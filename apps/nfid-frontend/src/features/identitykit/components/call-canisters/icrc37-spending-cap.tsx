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
      title={CanisterCallTitle.icrc7_transfer}
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
        <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 border border-gray-200 dark:border-zinc-600 rounded-[12px]">
          <ImageWithFallback
            alt={metadata.tokenName}
            src={metadata.tokenImage ?? metadata.collectionLogo ?? "#"}
            fallbackSrc={IconNftPlaceholder}
            className="w-[48px] h-[48px] rounded-[8px] object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate dark:text-white">
              {metadata.tokenName}
            </p>
            <p className="text-xs text-gray-400 truncate dark:text-zinc-500">
              {metadata.collectionName}
            </p>
          </div>
          <IconCmpArrow className="w-4 h-4 text-gray-400 rotate-180 shrink-0 dark:text-zinc-500" />
        </div>

        <div className="flex items-center justify-between h-[54px] text-sm dark:text-white">
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
