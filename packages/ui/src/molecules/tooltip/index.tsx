import * as RadixTooltip from "@radix-ui/react-tooltip"
import clsx from "clsx"
import React, { useState } from "react"

import { getIsMobileDeviceMatch } from "frontend/integration/device"

interface TooltipProps extends RadixTooltip.TooltipContentProps {
  tip: string | React.ReactNode
  children: React.ReactNode
}

export const Tooltip: React.FC<TooltipProps> = ({
  tip,
  children,
  className,
  ...contentProps
}) => {
  const [open, setOpen] = useState(false)

  return (
    <RadixTooltip.Root open={open} onOpenChange={setOpen}>
      <RadixTooltip.Trigger
        asChild
        onClick={() => {
          if (!getIsMobileDeviceMatch()) return
          setOpen(!open)
        }}
      >
        {children}
      </RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          sideOffset={5}
          forceMount={true}
          className={clsx(
            "text-white text-sm font-light bg-black py-2 px-6 rounded",
            className,
            ["left", "right"].includes(contentProps.side || "top")
              ? "my-2"
              : "mx-2",
          )}
          {...contentProps}
        >
          {tip}
          <RadixTooltip.Arrow />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  )
}
