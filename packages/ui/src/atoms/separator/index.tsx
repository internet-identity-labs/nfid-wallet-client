import clsx from "clsx"
import React from "react"

import { ElementProps } from "frontend/types/react"

interface SeparatorProps extends ElementProps<HTMLDivElement> {}

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
