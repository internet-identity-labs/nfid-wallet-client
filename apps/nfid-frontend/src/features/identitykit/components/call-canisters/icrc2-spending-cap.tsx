import React from "react"

import { Checkbox } from "@nfid-frontend/ui"

import { TickerAmount } from "frontend/ui/molecules/ticker-amount"

import { ICRC2Metadata } from "../../service/canister-calls-helpers/icrc2-approve"
import { RPCPromptTemplate } from "../templates/prompt-template"
import { CallCanisterDetails } from "./details"

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
  const [isChecked, setIsChecked] = React.useState(false)
  const applicationName = new URL(origin).host

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
      isPrimaryDisabled={!isChecked}
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
            value={Number(metadata.amount)}
            decimals={metadata.decimals}
          />
        </p>

        <div className="flex items-center justify-between h-[54px] text-sm mt-5">
          <div>Approval fee</div>
          <div className="text-right">
            <TickerAmount
              symbol={metadata.symbol}
              value={Number(metadata.fee)}
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
        <div className="flex items-start gap-2.5">
          <Checkbox
            className="mt-1 cursor-pointer"
            value={"isChecked"}
            id="isChecked"
            isChecked={isChecked}
            onChange={(is) => setIsChecked(!is)}
          />
          <label htmlFor="isChecked" className="text-sm cursor-pointer">
            I trust this website and understand it can spend up to the spending
            cap until I revoke this permission.
          </label>
        </div>
      </div>
    </RPCPromptTemplate>
  )
}

export default CallCanisterICRC2SpendingCap
