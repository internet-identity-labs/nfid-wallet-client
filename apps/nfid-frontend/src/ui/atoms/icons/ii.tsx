import clsx from "clsx"
import React from "react"

import { Image } from "@nfid-frontend/ui"

import dfinity from "frontend/assets/dfinity.svg"

interface IIIconProps extends React.SVGProps<HTMLImageElement> {}

export const IIIcon: React.FC<IIIconProps> = ({ className, onClick }) => {
  return (
    <Image
      src={dfinity}
      alt="ii"
      className={clsx("w-6 h-6", className)}
      onClick={onClick}
    />
  )
}
