import clsx from "clsx"

import { IconCmpInfo, Tooltip } from "@nfid-frontend/ui"

interface IInfoListItem {
  title: string
  description?: string | JSX.Element
  icon?: JSX.Element
  tooltip?: string
  isBold?: boolean
  subDescription?: string
  className?: string
}

export const InfoListItem = ({
  icon,
  title,
  description,
  tooltip,
  isBold,
  subDescription,
  className,
}: IInfoListItem) => {
  return (
    <div className={clsx("flex items-center", isBold && "font-bold")}>
      <div className="relative flex justify-between w-full">
        <div className="flex space-x-1 mr-2.5">
          <p className={clsx("whitespace-nowrap", className)}>{title}</p>
          {tooltip && (
            <Tooltip tip={tooltip}>
              <IconCmpInfo className="w-4 text-gray-400" />
            </Tooltip>
          )}
        </div>

        <div>{description}</div>
        {subDescription && (
          <div
            className={clsx(
              "text-xs leading-4 text-gray-400",
              "absolute right-0 top-full",
            )}
          >
            {subDescription}
          </div>
        )}
      </div>
      {icon}
    </div>
  )
}
