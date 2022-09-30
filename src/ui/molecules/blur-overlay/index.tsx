import clsx from "clsx"
import React from "react"

import { ElementProps } from "frontend/types/react"

interface BlurOverlayProps extends ElementProps<HTMLDivElement> {}

export const BlurOverlay: React.FC<BlurOverlayProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={clsx("", className)}
      style={{
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      {children}
    </div>
  )
}
