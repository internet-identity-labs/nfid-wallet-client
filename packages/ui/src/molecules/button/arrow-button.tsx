import clsx from "clsx"
import React from "react"

import { Button } from "."
import { ReactComponent as ArrowLeft } from "@nfid/ui/atoms/icons/arrow.svg"

interface ArrowButtonProps {
  direction?: "left" | "right" | "top" | "bottom"
  onClick?: () => void
  buttonClassName?: string
  iconClassName?: string
}

export const ArrowButton: React.FC<ArrowButtonProps> = ({
  direction = "right",
  onClick,
  buttonClassName,
  iconClassName,
}) => {
  return (
    <Button onClick={onClick} className={buttonClassName} type="ghost">
      <ArrowLeft
        className={clsx(
          direction === "right" && "",
          direction === "left" && "transform rotate-180",
          direction === "top" && "transform rotate-90",
          direction === "bottom" && "transform -rotate-90",
          iconClassName,
        )}
      />
    </Button>
  )
}
