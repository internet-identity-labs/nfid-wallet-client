import clsx from "clsx"
import { IconCmpArrowRight } from "@nfid/ui/atoms/icons"

import { IGroupOption } from "../types"

interface IDefaultTrigger {
  selectedOption?: IGroupOption
  actionHandler: () => void
  iconClassnames?: string
  id?: string
}

export const DefaultTrigger = ({
  selectedOption,
  actionHandler,
  iconClassnames,
  id,
}: IDefaultTrigger) => {
  return (
    <div
      id={id}
      className={clsx(
        "border border-black rounded-[12px] cursor-pointer h-14",
        "flex items-center justify-between hover:opacity-70",
        "text-black px-4 mb-4",
      )}
      onClick={actionHandler}
    >
      <div
        className="flex items-center"
        id={"option_" + selectedOption?.title.replace(/\s/g, "")}
      >
        {selectedOption?.icon && (
          <img
            src={selectedOption?.icon}
            alt={selectedOption?.value}
            className={clsx("mr-2.5 w-12 h-12 object-cover", iconClassnames)}
          />
        )}
        {selectedOption?.subTitle ? (
          <div className="leading-5">
            <p className="text-sm">{selectedOption?.title}</p>
            <p className="text-xs text-gray-400">{selectedOption?.subTitle}</p>
          </div>
        ) : (
          <p className="text-sm">{selectedOption?.title}</p>
        )}
      </div>
      <IconCmpArrowRight />
    </div>
  )
}
