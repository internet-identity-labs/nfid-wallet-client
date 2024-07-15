import clsx from "clsx"
import React from "react"

import { RadioButton } from "@nfid-frontend/ui"

import { Account } from "../../type"
import { RPCPromptTemplate } from "../templates/prompt-template"

export interface IRPCComponentICRC27 {
  publicProfile: Account
  anonymous: Account[]
  onApprove: (data: Account[]) => void
  onReject: () => void
}

export const RPCComponentICRC27 = ({
  publicProfile,
  anonymous,
  onApprove,
  onReject,
}: IRPCComponentICRC27) => {
  const [selectedProfile, setSelectedProfile] =
    React.useState<Account>(publicProfile)

  const applicationName = new URL(origin).host

  return (
    <RPCPromptTemplate
      subTitle={
        <>
          Wallet permissions for{" "}
          <span className="text-[#146F68]">{applicationName}</span>
        </>
      }
      onApprove={() => onApprove([selectedProfile])}
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
              )}
            >
              <div className="flex items-center">
                <RadioButton
                  id="profile_public"
                  onChange={(e) => setSelectedProfile(publicProfile)}
                  value={publicProfile.principal}
                  checked={true}
                  name={"profile"}
                />
                <label
                  htmlFor="profile_public"
                  className="ml-2 lowercase cursor-pointer"
                >
                  {publicProfile.displayName}
                </label>
              </div>
              {publicProfile?.balance ? (
                <div>{publicProfile?.balance} ICP</div>
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

            {/* Legacy anonymous profiles */}
            {anonymous?.map((acc) => (
              <div
                className="flex items-center h-5 mt-5 font-mono text-xs text-gray-400 uppercase pointer-events-none"
                key={`legacy_persona_${acc.id}`}
              >
                <RadioButton
                  id={`profile_legacy_${acc.id}`}
                  value={`anonymous-${acc.id}`}
                  checked={false}
                  name={`profile-${acc.id}`}
                  text={acc.displayName}
                  disabled
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </RPCPromptTemplate>
  )
}
