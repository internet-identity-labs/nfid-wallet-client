import clsx from "clsx"
import React from "react"

import { useDeviceInfo } from "frontend/hooks/use-device-info"
import { ElementProps } from "frontend/types/react"

interface BlurOverlayProps extends ElementProps<HTMLDivElement> {}

export const BlurOverlay: React.FC<BlurOverlayProps> = ({
  children,
  className,
}) => {
  const { browser } = useDeviceInfo()

  return (
    <div
      className={clsx("", className)}
      style={{
        background:
          browser.name === "Firefox"
            ? "rgba(255, 255, 255, 0.85)"
            : "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      {children}
    </div>
  )
}
