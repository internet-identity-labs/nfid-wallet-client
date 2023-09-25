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
      id="publicProfileID"
      className={clsx(
        "flex items-center w-full",
        isAvailable
          ? "border border-gray-300 hover:border-blue-600 hover:bg-blue-50 px-2.5 h-[70px] space-x-2.5 transition-all rounded-md cursor-pointer hover:shadow-[0px_0px_2px_0px_#0E62FF] text-sm"
          : "border border-gray-100 bg-gray-50 px-2.5 h-[70px] space-x-2.5 rounded-md ",
      )}
      onClick={isAvailable ? onClick : undefined}
    >
      <>
        <img alt="user" src={User} className="w-10 h-10 shrink-0" />
        <div
          className={clsx(
            "flex items-center justify-between w-full text-sm ",
            isAvailable ? "text-black" : "text-gray-400",
          )}
        >
          <div className="">My NFID profile</div>
          {isLoading ? (
            <div className="flex flex-col"></div>
          ) : (
            <div className="flex flex-col">
              <div className="text-right">{publicProfile?.balance} ICP</div>
              <div className="text-xs text-right">
                {publicProfile?.balanceUSD}
              </div>
            </div>
          )}
        </div>
      </>
    </div>
  )
}
