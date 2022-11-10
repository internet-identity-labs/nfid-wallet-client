import clsx from "clsx"
import React from "react"

import { Button } from "."
import { ReactComponent as ArrowLeft } from "../icons/arrow-left.svg"

interface ArrowButtonProps {
  direction?: "left" | "right" | "top" | "bottom"
  alt: string
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
    <Button onClick={onClick} icon className={buttonClassName}>
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
