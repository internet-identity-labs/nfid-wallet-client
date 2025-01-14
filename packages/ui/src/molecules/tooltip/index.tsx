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
  return (
    <RadixTooltip.Root delayDuration={0}>
      <RadixTooltip.Trigger
        asChild
        onClick={(e) => {
          e.preventDefault()
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
          onPointerDownOutside={(event) => {
            event.preventDefault()
          }}
        >
          {tip}
          <RadixTooltip.Arrow className={arrowClassname} />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  )
}
