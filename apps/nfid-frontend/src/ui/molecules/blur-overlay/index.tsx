import clsx from "clsx"
import React from "react"

import { getBrowser } from "@nfid-frontend/utils"

import { ElementProps } from "frontend/types/react"

interface BlurOverlayProps extends ElementProps<HTMLDivElement> {}

export const BlurOverlay: React.FC<BlurOverlayProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={clsx("", className)}
      style={
        getBrowser() !== "Firefox"
          ? {
              background: "text-black/10",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }
          : {}
      }
    >
      {children}
    </div>
  )
}
