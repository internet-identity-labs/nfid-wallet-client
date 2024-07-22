import clsx from "clsx"
import React from "react"

import { RadioButton } from "@nfid-frontend/ui"
import { ICP_DECIMALS } from "@nfid/integration/token/constants"

import { TickerAmount } from "frontend/ui/molecules/ticker-amount"

import { Account } from "../../type"
import { RPCPromptTemplate } from "../templates/prompt-template"

export interface IRPCComponentICRC34 {
  publicProfile: Account
  anonymous: Account[]
  isPublicAvailable: boolean
  onApprove: (data: Account) => void
  onReject: () => void
}

const RPCComponentICRC34 = ({
  publicProfile,
  anonymous,
  isPublicAvailable,
  onApprove,
  onReject,
}: IRPCComponentICRC34) => {
  const [selectedProfile, setSelectedProfile] = React.useState<Account>(
    isPublicAvailable ? publicProfile : anonymous[0],
  )

  const applicationName = new URL(origin).host

  return (
    <RPCPromptTemplate
      subTitle={
        <a
          href={origin}
          target="_blank"
          className="text-[#146F68] no-underline"
          rel="noreferrer"
        >
          {applicationName}
        </a>
      }
      onApprove={() => onApprove(selectedProfile)}
      onReject={onReject}
    >
      <div className="relative flex flex-col flex-1 w-full">
        <div
          className={clsx(
            "w-full pt-4 pb-[26px] rounded-xl mb-5",
            "flex flex-col flex-1 font-inter bg-white",
            "border border-gray-200",
            "shadow-[0px_4px_10px_0px_rgba(0,0,0,0.02)]",
            "mt-9",
          )}
        >
          <div className="px-5">
            <p className="text-sm font-bold">Share NFID Wallet address</p>
            <p className="mt-2 text-xs text-gray-500">
              Allow this site to request payments and view your <br /> balances.
            </p>
            <div
              className={clsx(
                "flex justify-between text-xs uppercase font-mono h-5 mt-5",
                !isPublicAvailable && "pointer-events-none",
              )}
            >
              <div className="flex items-center">
                <RadioButton
                  id="profile_public"
                  onChange={(e) => setSelectedProfile(publicProfile)}
                  value={publicProfile.principal}
                  checked={
                    selectedProfile.principal === publicProfile.principal
                  }
                  name={"profile"}
                  disabled={!isPublicAvailable}
                />
                <label
                  htmlFor="profile_public"
                  className="ml-2 lowercase cursor-pointer"
                >
                  {publicProfile.displayName}
                </label>
              </div>
              {publicProfile?.balance ? (
                <TickerAmount
                  symbol={"ICP"}
                  value={publicProfile.balance}
                  decimals={ICP_DECIMALS}
                />
              ) : null}
            </div>
          </div>
          <div className="bg-gray-200 w-full h-[1px] mt-[30px] mb-5" />
          <div className="flex-1 px-5">
            <p className="text-sm font-bold">Hide NFID Wallet address</p>
            <p className="mt-2 text-xs text-gray-500">
              Connect anonymously to prevent this site from <br /> requesting
              payments and viewing your balances.
            </p>

            {anonymous?.map((acc) => (
              <div
                className="flex items-center h-5 mt-5 font-mono text-xs text-gray-400 lowercase"
                key={`legacy_persona_${acc.id}`}
              >
                <RadioButton
                  id={`profile_legacy_${acc.id}`}
                  value={`anonymous-${acc.id}`}
                  onChange={(e) => setSelectedProfile(acc)}
                  checked={selectedProfile.principal === acc.principal}
                  name={`profile-${acc.id}`}
                  text={acc.displayName}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </RPCPromptTemplate>
  )
}

export default RPCComponentICRC34
