import BigNumber from "bignumber.js"
import clsx from "clsx"

import { ArrowPercentChange } from "../../atoms/arrow-percent-change"
import { Skeleton } from "../../atoms/skeleton"

export function Balance({
  isLoading,
  usdBalance,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  isLoading?: boolean
  usdBalance:
    | {
        value: string
        dayChange?: string
        dayChangePercent?: string
        dayChangePositive?: boolean
      }
    | undefined
}) {
  return (
    <div
      {...props}
      className={clsx("text-black text-[32px] leading-[20px]", props.className)}
    >
      {isLoading ? (
        <Skeleton className="w-[50%] h-[24px]" />
      ) : (
        <div className="flex flex-wrap items-baseline">
          <div className="font-semibold dark:text-white">
            {usdBalance?.value || "0.00"}{" "}
            <span className="text-[16px] font-bold uppercase self-end mr-3">
              usd
            </span>
          </div>
          {usdBalance?.value &&
            !BigNumber(usdBalance?.value).eq(0) &&
            usdBalance?.dayChange &&
            usdBalance.dayChangePercent && (
              <div className="flex mt-2.5">
                <small
                  className={clsx("text-xs font-bold mr-2.5 self-end", {
                    "text-emerald-600 dark:text-emerald-500":
                      usdBalance.dayChangePositive,
                    "text-red-600 dark:text-red-500":
                      !usdBalance.dayChangePositive,
                  })}
                >
                  {usdBalance.dayChangePositive && "+"}
                  {usdBalance.dayChange} USD
                </small>
                <ArrowPercentChange
                  className="self-end"
                  value={usdBalance.dayChangePercent}
                  positive={usdBalance.dayChangePositive}
                  positiveClassName="text-emerald-600 dark:text-emerald-500"
                />
                <small className="text-xs ml-2.5 self-end dark:text-white">
                  last 24h
                </small>
              </div>
            )}
        </div>
      )}
    </div>
  )
}
