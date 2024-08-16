import clsx from "clsx"
import React from "react"

import { IconCmpArrow } from "@nfid-frontend/ui"

export interface CallCanisterDetailsProps {
  canisterId: string
  sender: string
  args: string
}

export const CallCanisterDetails = ({
  args,
  canisterId,
  sender,
}: CallCanisterDetailsProps) => {
  const [showDetails, setShowDetails] = React.useState(false)

  const renderArgs = (args: unknown) => {
    if (args instanceof Object) {
      return Object.entries(args as { [key: string]: unknown }).map(
        ([key, value]) => (
          <div className="grid grid-cols-[150px,1fr]">
            <div className="font-bold">{key}</div>
            <div>
              {JSON.stringify(
                value,
                (_, value) =>
                  typeof value === "bigint" ? value.toString() : value,
                0,
              )}
            </div>
          </div>
        ),
      )
    }

    const value = JSON.stringify(
      args,
      (_, value) => (typeof value === "bigint" ? value.toString() : value),
      2,
    )

    return <div>{value}</div>
  }

  return (
    <>
      <p
        onClick={() => setShowDetails(true)}
        className="text-[#146F68] hover:text-teal-600 text-sm mt-2.5 cursor-pointer"
      >
        Transaction details
      </p>

      <div
        className={clsx(
          showDetails ? "block" : "hidden",
          "absolute left-0 top-0 w-full h-full bg-white z-[999]",
          "p-5 flex flex-col",
        )}
      >
        <div className="flex items-center gap-2.5">
          <IconCmpArrow
            className="transition-opacity cursor-pointer hover:opacity-50"
            onClick={() => setShowDetails(false)}
          />
          <p className="text-[20px] font-bold">Transaction details</p>
        </div>
        <p className="mt-5 text-sm">
          To protect yourself against scammers, take a moment to verify
          transaction details.
        </p>
        <div
          className={clsx(
            "rounded-xl border border-gray-200 px-3.5 py-2.5 flex-1 space-y-4",
            "text-gray-500 break-all text-sm mt-2.5",
            "overflow-auto space-y-3",
          )}
        >
          <div className="grid grid-cols-[150px,1fr]">
            <div className="font-bold">Canister ID</div>
            <div>{canisterId}</div>
          </div>
          <div className="grid grid-cols-[150px,1fr]">
            <div className="font-bold">Sender</div>
            <div>{sender}</div>
          </div>
          <div className="font-bold">Arguments</div>
          {renderArgs(JSON.parse(args)[0])}
        </div>
      </div>
    </>
  )
}
