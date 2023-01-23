import clsx from "clsx"

import { IconCmpGrid, IconCmpTable } from "@nfid-frontend/ui"

interface IDisplaySwitch {
  state: "grid" | "table"
  setState: (state: "grid" | "table") => void
}

export const DisplaySwitch = ({ state, setState }: IDisplaySwitch) => {
  return (
    <div className={clsx(`gap-3 bg-white p-1 rounded-md`, "hidden sm:flex")}>
      <div
        onClick={() => setState("grid")}
        className={clsx(
          "p-0 w-10 h-10 outline-none rounded-[4px]",
          "hover:text-gray-100 transition-all cursor-pointer",
          "flex justify-center items-center",
          state === "grid" && "bg-gray-200",
        )}
      >
        <IconCmpGrid
          className={clsx("text-black", state !== "grid" && "!text-gray-400")}
        />
      </div>
      <div
        onClick={() => setState("table")}
        className={clsx(
          "p-0 w-10 h-10  outline-none rounded-[4px]",
          "hover:text-gray-100 transition-all cursor-pointer",
          "flex justify-center items-center",
          state === "table" && "bg-gray-200",
        )}
      >
        <IconCmpTable
          className={clsx("text-black", state !== "table" && "!text-gray-400")}
        />
      </div>
    </div>
  )
}
