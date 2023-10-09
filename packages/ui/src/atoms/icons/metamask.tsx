import clsx from "clsx"
import React from "react"

import Metamask from "./metamask.png"

interface IconMetamaskProps extends React.HTMLAttributes<HTMLDivElement> {
  onClick?: () => void
}

export const IconMetamask: React.FC<IconMetamaskProps> = ({
  className,
  onClick,
}) => {
  return (
    <img
      src={Metamask}
      className={clsx("cursor-pointer", className)}
      onClick={onClick}
      alt="metamask"
    />
  )
}
