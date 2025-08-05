import clsx from "clsx"

import { IconCmpArrowRightIcon } from "@nfid-frontend/ui"

export function ArrowPercentChange({
  value,
  positive,
  positiveClassName,
  className,
}: {
  value: string
  positive?: boolean
  positiveClassName?: string
  className?: string
}) {
  return (
    <small
      className={clsx(
        "text-xs flex relative",
        {
          [positiveClassName || "text-green-600 dark:text-emerald-500"]:
            positive,
          "text-red-600 dark:text-red-500": !positive,
        },
        className,
      )}
    >
      <IconCmpArrowRightIcon
        height={18}
        className={clsx(
          "ms-[-5px] absolute",
          positive ? "-rotate-90 mt-[-2px]" : "rotate-90",
        )}
      />
      <span className="ms-[-5px] ps-[18px]">{value}%</span>
    </small>
  )
}
