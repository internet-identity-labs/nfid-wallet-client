import clsx from "clsx"
import { IconCmpArrowRight } from "packages/ui/src/atoms/icons"

import { IGroupOption } from "../types"

interface IDefaultTrigger {
  selectedOption?: IGroupOption
  actionHandler: () => void
}

export const DefaultTrigger = ({
  selectedOption,
  actionHandler,
}: IDefaultTrigger) => {
  return (
    <div
      className={clsx(
        "border border-black rounded-md cursor-pointer h-14",
        "flex items-center justify-between hover:opacity-70",
        "text-black px-4",
      )}
      onClick={actionHandler}
    >
      <div className="flex">
        {selectedOption?.icon && (
          <img
            src={selectedOption?.icon}
            alt={selectedOption?.value}
            className="mr-2.5"
          />
        )}
        <div className="leading-5">
          <p className="text-sm">{selectedOption?.title}</p>
          <p className="text-xs text-gray-400">{selectedOption?.subTitle}</p>
        </div>
      </div>
      <IconCmpArrowRight />
    </div>
  )
}
