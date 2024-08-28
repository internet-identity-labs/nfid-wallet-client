import clsx from "clsx"
import React from "react"

import { IconCmpArrow } from "@nfid-frontend/ui"

export interface CallCanisterDetailsProps {
  canisterId: string
  sender: string
  args: string
}

export const renderArgs = (args: unknown) => {
  if (args instanceof Object) {
    return Object.entries(args as { [key: string]: unknown }).map(
      ([key, value]) => (
        <div key={`argument_${key}`} className="grid grid-cols-[180px,1fr]">
          <div className="ml-3">{key}</div>
          <div className="">
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

export const CallCanisterDetails = ({
  args,
  canisterId,
  sender,
}: CallCanisterDetailsProps) => {
  const [showDetails, setShowDetails] = React.useState(false)

  return (
    <>
      <p
        onClick={() => setShowDetails(true)}
        className="text-[#146F68] hover:text-teal-600 text-sm mt-2.5 cursor-pointer"
      >
        Transaction details
      </p>

      {/* Quick fix to adjust height and keep absolute on actual element */}
      {showDetails && (
        <div className="space-y-4 lg:hidden">
          {renderArgs(JSON.parse(args)[0])}
        </div>
      )}

      <div
        className={clsx(
          showDetails ? "block" : "hidden",
          "absolute bg-white z-[999] w-full lg:h-screen",
          "left-0 top-0",
          "flex items-center justify-center lg:pr-[10%]",
        )}
      >
        <div
          className={clsx(
            "p-5 flex flex-col",
            "w-full lg:w-3/5 lg:min-w-[387px] min-h-[448px] flex flex-col",
          )}
        >
          <p className="text-[20px] lg:text-[28px] font-bold text-center">
            Transaction details
          </p>
          <p className="mt-10 text-sm">
            To protect yourself against scammers, take a moment to verify
            transaction details.
          </p>
          <div
            className={clsx(
              "rounded-xl border border-gray-200 px-3.5 py-2.5 flex-1 space-y-4",
              "text-gray-500 break-all text-sm mt-5",
            )}
          >
            <div className="grid grid-cols-[180px,1fr]">
              <div className="font-bold">Canister ID</div>
              <div>{canisterId}</div>
            </div>
            <div className="grid grid-cols-[180px,1fr]">
              <div className="font-bold">Sender</div>
              <div>{sender}</div>
            </div>
            <div className="font-bold">Arguments</div>
            {renderArgs(JSON.parse(args)[0])}
          </div>
          <IconCmpArrow
            className={clsx(
              "transition-opacity cursor-pointer hover:opacity-50 z-20",
              "absolute left-5 top-5",
            )}
            onClick={() => setShowDetails(false)}
          />
        </div>
      </div>
    </>
  )
}
