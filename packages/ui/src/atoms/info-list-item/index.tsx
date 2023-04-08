import clsx from "clsx"

import { IconCmpInfo, Tooltip } from "@nfid-frontend/ui"

interface IInfoListItem {
  title: string
  tooltip?: string
  isBold?: boolean
  className?: string
  children: JSX.Element | string
  icon?: JSX.Element | string
}

export const InfoListItem = ({
  title,
  children,
  tooltip,
  isBold,
  className,
  icon,
}: IInfoListItem) => {
  return (
    <div
      className={clsx(
        "flex items-center justify-between w-full text-sm",
        isBold && "font-bold",
      )}
    >
      <div className="flex space-x-1 mr-2.5 items-center">
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
