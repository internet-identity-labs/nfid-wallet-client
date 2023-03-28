import clsx from "clsx"
import { IconCmpArrowRight } from "packages/ui/src/atoms/icons"
import { Image } from "packages/ui/src/atoms/image"

import { IGroupOption } from "../types"

interface IDefaultTrigger {
  selectedOption?: IGroupOption
  actionHandler: () => void
  iconClassnames?: string
}

export const DefaultTrigger = ({
  selectedOption,
  actionHandler,
  iconClassnames,
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
          <Image
            src={selectedOption?.icon}
            alt={selectedOption?.value}
            className={clsx("mr-2.5 w-12 h-12 object-cover", iconClassnames)}
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
