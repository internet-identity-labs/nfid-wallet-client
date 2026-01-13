import clsx from "clsx"
import React from "react"

import { IconCmpArrow } from "@nfid/ui"

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
        className="text-primaryButtonColor hover:text-teal-600 text-sm mt-2.5 cursor-pointer dark:text-teal-500 dark:hover:text-teal-600"
      >
        Transaction details
      </p>

      <div
        className={clsx(
          showDetails ? "block" : "hidden",
          "absolute bg-white z-[999] w-full h-full lg:h-screen lg-pt-[140px] lg-pb-[40px] dark:bg-zinc-800",
          "left-0 top-0",
          "flex items-center justify-center",
        )}
      >
        <div
          className={clsx(
            "p-5 lg:p-0 flex flex-col",
            "w-full lg:w-3/5 lg:w-[387px] flex flex-col h-full lg:h-auto",
          )}
        >
          <p className="text-[20px] lg:text-[28px] font-bold text-center dark:text-white">
            Transaction details
          </p>
          <p className="mt-10 text-sm dark:text-white">
            To protect yourself against scammers, take a moment to verify
            transaction details.
          </p>
          <div
            className={clsx(
              "rounded-xl border border-gray-200 dark:border-zinc-400 px-3.5 py-2.5 overflow-y-auto space-y-4",
              "text-gray-500 dark:text-zinc-500 break-all text-sm mt-5",
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
            <div>{renderArgs(JSON.parse(args)[0])}</div>
          </div>
          <IconCmpArrow
            className={clsx(
              "transition-opacity cursor-pointer hover:opacity-50 z-20",
              "absolute left-5 top-5 dark:text-white",
            )}
            onClick={() => setShowDetails(false)}
          />
        </div>
      </div>
    </>
  )
}
