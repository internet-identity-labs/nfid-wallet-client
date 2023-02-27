import clsx from "clsx"

import { IconCmpInfo, Tooltip } from "@nfid-frontend/ui"

interface IInfoItem {
  title: string
  description?: string | JSX.Element
  icon?: JSX.Element
  tooltip?: string
  isBold?: boolean
  className?: string
}

export const InfoItem = ({
  icon,
  title,
  description,
  tooltip,
  isBold,
  className,
}: IInfoItem) => {
  return (
    <div className={clsx("flex items-center", isBold && "font-bold")}>
      <div className="flex justify-between w-full">
        <div className="flex space-x-1 mr-2.5">
          <p className={clsx("whitespace-nowrap", className)}>{title}</p>
          {tooltip && (
            <Tooltip tip={tooltip}>
              <IconCmpInfo className="w-4 text-gray-400" />
            </Tooltip>
          )}
        </div>

        <div>{description}</div>
      </div>
      {icon}
    </div>
  )
}
