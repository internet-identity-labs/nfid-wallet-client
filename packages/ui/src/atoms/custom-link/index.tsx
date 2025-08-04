import clsx from "clsx"
import { AnchorHTMLAttributes } from "react"

import { IconCmpExternalIcon } from "../icons"

export interface AProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  withGapBetweenChildren?: boolean
}

export const A = ({
  withGapBetweenChildren,
  children,
  className,
  ...props
}: AProps) => {
  return (
    <a
      className={clsx(
        "text-primaryButtonColor dark:text-teal-500 cursor-pointer",
        "hover:underline hover:text-teal-600 dark:hover:text-teal-700 transition duration-300 ease-in-out",
        withGapBetweenChildren && "flex items-center gap-2",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  )
}
