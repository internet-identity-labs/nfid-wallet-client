import clsx from "clsx"

import { IconCmpArrowRight } from "@nfid/ui/atoms/icons"

export interface IFeeModalOption {
  title: string
  subTitle: string
  innerTitle: string
  innerSubtitle: string
  onClick: () => void
  onConfig?: () => void
}

export const FeeModalOption = ({
  title,
  subTitle,
  innerTitle,
  innerSubtitle,
  onClick,
  onConfig,
}: IFeeModalOption) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "border border-gray-300 rounded-md h-[60px] w-full",
        "flex items-center justify-between",
        "py-2.5 px-3.5 cursor-pointer ring-blue-300",
        "hover:bg-blue-50 transition-all active:border-blue-600 active:ring-1",
      )}
    >
      <div className="flex items-center">
        <div>
          <p className="text-sm mb-0.5">{title}</p>
          <p className="text-xs text-gray-400">{subTitle}</p>
        </div>
      </div>
      <div className="flex items-center h-full">
        <div>
          <p className="text-sm text-right">{innerTitle}</p>
          <p className="text-xs text-right text-gray-400">{innerSubtitle}</p>
        </div>
        {onConfig && (
          <div
            className={clsx(
              "border-l border-gray-300 w-[35px] h-full pr-1",
              "flex items-center justify-end ml-2.5",
            )}
            onClick={(e) => {
              e.stopPropagation()
              onConfig()
            }}
          >
            <IconCmpArrowRight />
          </div>
        )}
      </div>
    </div>
  )
}
