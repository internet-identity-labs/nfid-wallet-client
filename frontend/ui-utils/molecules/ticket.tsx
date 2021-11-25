import clsx from "clsx"
import React from "react"
import { AvatarDan } from "../atoms/avatar/dan"

export const AuthTicket: React.FC = () => {
  return (
    <div
      className={clsx(
        "relative",
        "shadow-bottom-sheet",
        "rounded overflow-hidden",
        "bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 ",
        "p-[3px]",
        "text-white",
      )}
    >
      <div className={clsx("rounded-[3px] bg-gray-900 flex flex-row")}>
        {/* left col */}
        <div className={clsx("p-7 flex-grow")}>
          <div className={clsx("flex flex-row")}>
            <AvatarDan />
            <div className={clsx("ml-4 font-bold text-xl")}>Dan Ostrovski</div>
          </div>
          <div className={clsx("flex text-xs mt-3")}>
            <div className={clsx("italic mr-2")}>powered by</div>
            <div className={clsx("font-medium tracking-wide")}>Multipass</div>
          </div>
        </div>
        {/* right col */}
        {/* <div
          className={clsx(
            "flex-shrink border-l border-dashed  text-white absolute bottom-0",
          )}
        >
          <div className={clsx("rotate-90 whitespace-nowrap text-center")}>
            No 10001
          </div>
        </div> */}
      </div>
    </div>
  )
}
