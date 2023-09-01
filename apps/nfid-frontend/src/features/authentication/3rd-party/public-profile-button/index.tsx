import clsx from "clsx"
import User from "src/assets/userpics/userpic_6.svg"
import useSWR from "swr"

import { getPublicProfile } from "../choose-account/services"

export interface IPublicProfileButton {
  isAvailable: boolean
  onClick: () => void
}
export const PublicProfileButton = ({
  isAvailable,
  onClick,
}: IPublicProfileButton) => {
  const { data: publicProfile, isLoading } = useSWR(
    "publicProfile",
    getPublicProfile,
  )

  return (
    <div
      className={clsx(
        "flex items-center w-full",
        isAvailable
          ? "border border-gray-300 hover:border-blue-600 hover:bg-blue-50 px-2.5 h-[70px] space-x-2.5 transition-all rounded-md cursor-pointer hover:shadow-[0px_0px_2px_0px_#0E62FF] text-sm"
          : "border border-gray-100 bg-gray-50 px-2.5 h-[70px] space-x-2.5 rounded-md ",
      )}
      onClick={isAvailable ? onClick : undefined}
    >
      {isLoading ? (
        <div className="flex items-center w-full space-x-3 opacity-10 animate-pulse">
          <svg
            className="w-10 h-10 text-gray-200 dark:text-gray-700"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
          </svg>
          <div className="flex-1 h-3 bg-gray-200 rounded-full dark:bg-gray-700"></div>
          <div className="flex-col items-center w-10 space-y-2">
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
          </div>
        </div>
      ) : (
        <>
          <img alt="user" src={User} className="w-10 h-10 shrink-0" />
          <div
            className={clsx(
              "flex items-center justify-between w-full text-sm ",
              isAvailable ? "text-black" : "text-gray-400",
            )}
          >
            <div className="">{publicProfile?.label}</div>
            <div className="flex flex-col">
              <div className="text-right">{publicProfile?.balance} ICP</div>
              <div className="text-xs text-right">
                {publicProfile?.balanceUSD}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
