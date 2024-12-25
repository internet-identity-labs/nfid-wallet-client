import clsx from "clsx"
import { IconCmpArrowRight } from "packages/ui/src/atoms/icons"

import { IGroupOption } from "../types"

interface ISmallTrigger {
  selectedOption?: IGroupOption
  actionHandler: () => void
  iconClassnames?: string
  id?: string
}

export const SmallTrigger = ({
  selectedOption,
  actionHandler,
  iconClassnames,
  id,
}: ISmallTrigger) => {
  return (
    <div
      id={id}
      className={clsx(
        "border border-black rounded-md cursor-pointer h-10",
        "flex items-center justify-between hover:opacity-70",
        "text-black px-4",
      )}
      onClick={actionHandler}
    >
      <div className="flex items-center">
        {selectedOption?.icon && (
          <img
            src={selectedOption?.icon}
            alt={selectedOption?.value}
            className={clsx("mr-2.5 w-12 h-12 object-cover", iconClassnames)}
          />
        )}
        <p className="text-sm">{selectedOption?.title}</p>
      </div>
      <IconCmpArrowRight />
    </div>
  )
}
