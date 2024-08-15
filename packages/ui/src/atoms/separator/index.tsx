import clsx from "clsx"
import React from "react"

import { ElementProps } from "frontend/types/react"

interface SeparatorProps extends ElementProps<HTMLDivElement> {}

export const Separator: React.FC<SeparatorProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={clsx(
        "flex items-center justify-between w-full text-sm text-secondary h-9",
        className,
      )}
    >
      <div className="flex w-full h-[1px] bg-gray-300" />
      <div className="px-2">OR</div>
      <div className="flex w-full h-[1px] bg-gray-300" />
    </div>
  )
}
