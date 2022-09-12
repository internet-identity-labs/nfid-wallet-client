import clsx from "clsx"
import React from "react"

interface Props {
  className?: string
  onClick?: React.MouseEventHandler<HTMLDivElement>
  title: JSX.Element | string
  subtitle?: string | React.ReactNode
  icon?: React.ReactNode
  accountsLength: number
}

export const ApplicationListItem: React.FC<Props> = ({
  className,
  title,
  subtitle,
  icon,
  onClick,
  accountsLength,
}) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "relative flex flex-row hover:bg-gray-50 hover:rounded transition-colors duration-100 -mx-3",
        "h-[60px] border-b border-gray-200",
        className,
      )}
    >
      <div className="flex flex-wrap items-center flex-1 px-3 py-0 cursor-pointer select-none peer">
        {icon && (
          <div className="mr-4">
            <div className="relative flex items-center justify-center bg-white rounded-full w-9 h-9">
              {icon}
            </div>
          </div>
        )}

        <div className="relative flex items-center flex-1">
          <div className="flex-1 flex-shrink">
            <div className={clsx("text-gray-700")}>{title}</div>
            {subtitle && (
              <div className="flex justify-between my-1 text-sm text-gray-400">
                <span>{subtitle}</span>
                <span>
                  {accountsLength} {accountsLength > 1 ? "accounts" : "account"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
