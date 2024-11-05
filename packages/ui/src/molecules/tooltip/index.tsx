import * as RadixTooltip from "@radix-ui/react-tooltip"
import clsx from "clsx"
import { getIsMobileDeviceMatch } from "packages/ui/src/utils/is-mobile"
import React, { useState } from "react"

interface TooltipProps extends RadixTooltip.TooltipContentProps {
  tip: string | React.ReactNode
  children: React.ReactNode
  arrowClassname?: string
}

export const Tooltip: React.FC<TooltipProps> = ({
  tip,
  children,
  className,
  arrowClassname,
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
            "text-white text-sm bg-black p-[15px] rounded-[6px]",
            className,
            ["left", "right"].includes(contentProps.side || "top")
              ? "my-2"
              : "mx-2",
          )}
          {...contentProps}
        >
          {tip}
          <RadixTooltip.Arrow className={arrowClassname} />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  )
}
