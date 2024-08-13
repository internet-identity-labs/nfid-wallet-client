import clsx from "clsx"

import { IconCmpGrid, IconCmpTable } from "@nfid-frontend/ui"

interface INFTDisplaySwitch {
  state: "grid" | "table"
  setState: (state: "grid" | "table") => void
}

export const NFTDisplaySwitch = ({ state, setState }: INFTDisplaySwitch) => {
  return (
    <div className={clsx(`gap-3 bg-white p-0.5 rounded-md`, "hidden sm:flex")}>
      <div
        onClick={() => setState("grid")}
        className={clsx(
          "p-0 w-[36px] h-[36px] outline-none rounded-[4px]",
          "hover:text-gray-100 transition-all cursor-pointer",
          "flex justify-center items-center",
          state === "grid" && "bg-gray-200",
        )}
      >
        <IconCmpGrid
          className={clsx("text-black", state !== "grid" && "!text-secondary")}
        />
      </div>
      <div
        id={"to-table"}
        onClick={() => setState("table")}
        className={clsx(
          "p-0 w-[36px] h-[36px] outline-none rounded-[4px]",
          "hover:text-gray-100 transition-all cursor-pointer",
          "flex justify-center items-center",
          state === "table" && "bg-gray-200",
        )}
      >
        <IconCmpTable
          className={clsx("text-black", state !== "table" && "!text-secondary")}
        />
      </div>
    </div>
  )
}
