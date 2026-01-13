import clsx from "clsx"
import React from "react"

import { HTMLAttributes } from "react"

interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {}

export const Separator: React.FC<SeparatorProps> = ({ className }) => {
  return (
    <div
      className={clsx(
        "text-center leading-[24px] text-sm text-secondary",
        className,
      )}
    >
      OR
    </div>
  )
}
