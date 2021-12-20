import clsx from "clsx"
import React from "react"
import TouchIdIcon from "./logo.png"

export const TouchId: React.FC<
  React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >
> = ({ className = "w-10" }) => <img src={TouchIdIcon} className={className} />
