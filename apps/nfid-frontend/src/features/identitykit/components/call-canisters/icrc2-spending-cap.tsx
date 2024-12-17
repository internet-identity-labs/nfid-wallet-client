import clsx from "clsx"
import { TickerAmount } from "packages/ui/src/molecules/ticker-amount"
import React from "react"

import { IconCmpWarning } from "@nfid-frontend/ui"

import { RPCPromptTemplate } from "../templates/prompt-template"
import { CallCanisterDetails } from "./details"
import { ICRC2Metadata } from "../../service/canister-calls-helpers/interfaces"

export interface CallCanisterICRC2SpendingCapProps {
  canisterId: string
  sender: string
  request: any
  args: any
  metadata: ICRC2Metadata
  onApprove: (data: any) => void
  onReject: () => void
}

const CallCanisterICRC2SpendingCap = ({
  canisterId,
  args,
  sender,
  request,
  metadata,
  onApprove,
  onReject,
}: CallCanisterICRC2SpendingCapProps) => {
  const applicationName = new URL(String(request?.origin)).host

  return (
    <RPCPromptTemplate
      title={`Approve spending cap`}
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
      onSecondaryButtonClick={onReject}
      onPrimaryButtonClick={() => onApprove(request)}
      balance={{
        address: metadata.address,
        symbol: metadata.symbol,
        balance: metadata.balance,
        decimals: metadata.decimals,
      }}
    >
      <div className="flex flex-col flex-1">
        <p className="text-[32px] font-medium text-center">
          <TickerAmount
            symbol={metadata.symbol}
            value={metadata.amount}
            decimals={metadata.decimals}
          />
        </p>

        <div className="flex items-center justify-between h-[54px] text-sm mt-5">
          <div>Approval fee</div>
          <div className="text-right">
            <TickerAmount
              symbol={metadata.symbol}
              value={metadata.fee}
              decimals={metadata.decimals}
            />
          </div>
        </div>
        <CallCanisterDetails
          canisterId={canisterId}
          sender={sender}
          args={args}
        />
        <div className="flex-1 min-h-[50px]" />
        <div
          className={clsx(
            "grid grid-cols-[22px,1fr] gap-2.5 text-sm rounded-xl",
            "bg-orange-50 p-[15px] mt-4 text-orange-900",
          )}
        >
          <IconCmpWarning className="text-orange-900 w-[22px] h-[22px] shrink-1" />
          <p>
            <span className="font-bold leading-[20px]">
              Proceed with caution.
            </span>{" "}
            This website can spend up to the spending cap until you revoke this
            permission.
          </p>
        </div>
      </div>
    </RPCPromptTemplate>
  )
}

export default CallCanisterICRC2SpendingCap
