import clsx from "clsx"

import { IconCmpInfo, Tooltip } from "@nfid/ui"

export interface IInfoListItem {
  title: string
  tooltip?: string
  isBold?: boolean
  className?: string
  children: JSX.Element | string
  icon?: JSX.Element | string
  isVerticalCentered?: boolean
}

export const InfoListItem = ({
  title,
  children,
  tooltip,
  isBold,
  className,
  icon,
  isVerticalCentered = true,
}: IInfoListItem) => {
  return (
    <div
      className={clsx(
        "flex justify-between w-full text-sm",
        isBold && "font-bold",
        isVerticalCentered && "items-center",
      )}
    >
      <div className="flex space-x-2 mr-2.5 items-center h-5">
        <p className={clsx("whitespace-nowrap", className)}>{title}</p>
        {tooltip && (
          <Tooltip tip={tooltip}>
            <IconCmpInfo className="w-4 text-gray-400" />
          </Tooltip>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {children} {icon}
      </div>
    </div>
  )
}
