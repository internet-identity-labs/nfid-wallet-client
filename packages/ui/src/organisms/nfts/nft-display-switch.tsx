import clsx from "clsx"

import { IconCmpGrid, IconCmpTable } from "@nfid-frontend/ui"

interface INFTDisplaySwitch {
  state: "grid" | "table"
  setState: (state: "grid" | "table") => void
}

export const NFTDisplaySwitch = ({ state, setState }: INFTDisplaySwitch) => {
  return (
    <div className={clsx("gap-3 p-0.5 rounded-[10px]", "flex")}>
      <div
        onClick={() => setState("grid")}
        className={clsx(
          "p-0 w-[36px] h-[36px] outline-none rounded-[10px]",
          "hover:text-gray-100 transition-all cursor-pointer",
          "flex justify-center items-center",
          state === "grid" && "border border-black dark:border-white",
        )}
      >
        <IconCmpGrid
          className={clsx(
            "text-black dark:text-white",
            state !== "grid" && "!text-secondary",
          )}
        />
      </div>
      <div
        id={"to-table"}
        onClick={() => setState("table")}
        className={clsx(
          "p-0 w-[36px] h-[36px] outline-none rounded-[10px]",
          "hover:text-gray-100 transition-all cursor-pointer",
          "flex justify-center items-center",
          state === "table" && "border border-black dark:border-white",
        )}
      >
        <IconCmpTable
          className={clsx(
            "text-black dark:text-white",
            state !== "table" && "!text-secondary",
          )}
        />
      </div>
    </div>
  )
}
