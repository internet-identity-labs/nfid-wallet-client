import clsx from "clsx"
import React, { HTMLAttributes } from "react"

interface BlurOverlayProps extends HTMLAttributes<HTMLDivElement> {}

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
