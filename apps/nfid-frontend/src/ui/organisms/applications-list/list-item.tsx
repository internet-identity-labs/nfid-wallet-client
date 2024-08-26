import clsx from "clsx"
import React from "react"

import { getUrl } from "@nfid-frontend/utils"

interface Props {
  className?: string
  onClick?: React.MouseEventHandler<HTMLDivElement>
  title: JSX.Element | string
  subtitle?: string | React.ReactNode
  domain: string
  icon?: React.ReactNode
  accountsLength: number
}

export const ApplicationListItem: React.FC<Props> = ({
  className,
  title,
  subtitle,
  icon,
  domain,
  onClick,
  accountsLength,
}) => {
  return (
    <a
      href={getUrl(domain).toString()}
      target="_blank"
      className={clsx(
        "relative flex hover:bg-gray-50 hover:rounded transition-colors duration-100",
        "h-[60px] border-b border-gray-200",
        className,
      )}
      rel="noreferrer"
    >
      <div className="flex items-center flex-1 px-3 py-0 overflow-hidden cursor-pointer select-none peer">
        {icon && <div className="mr-4">{icon}</div>}

        <div className="flex-col flex-1 overflow-hidden">
          <div
            className={clsx(
              "text-gray-700 overflow-hidden whitespace-nowrap text-ellipsis",
            )}
          >
            {title}
          </div>
          {subtitle && (
            <div className="flex justify-between my-1 space-x-2 overflow-hidden text-sm text-secondary">
              <span className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis">
                {subtitle}
              </span>
              <span className="flex-0 whitespace-nowrap">
                {accountsLength} {accountsLength > 1 ? "accounts" : "account"}
              </span>
            </div>
          )}
        </div>
      </div>
    </a>
  )
}
