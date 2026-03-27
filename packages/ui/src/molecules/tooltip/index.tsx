import * as RadixTooltip from "@radix-ui/react-tooltip"
import clsx from "clsx"
import { motion } from "framer-motion"
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
  const [isOpen, setIsOpen] = useState(false)

  return (
    <RadixTooltip.Root delayDuration={0} open={isOpen} onOpenChange={setIsOpen}>
      <RadixTooltip.Trigger
        asChild
        onClick={(e) => {
          if (!getIsMobileDeviceMatch()) e.preventDefault()
          else {
            setIsOpen(!isOpen)
          }
        }}
      >
        {children}
      </RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        {isOpen && (
          <RadixTooltip.Content
            asChild
            sideOffset={5}
            forceMount={true}
            {...contentProps}
            onPointerDownOutside={(event) => {
              if (!getIsMobileDeviceMatch()) event.preventDefault()
            }}
          >
            <motion.div
              className={clsx(
                "text-white text-sm bg-black dark:bg-zinc-700 p-[15px] rounded-[6px]",
                className,
                ["left", "right"].includes(contentProps.side || "top")
                  ? "my-2"
                  : "mx-2",
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {tip}
              <RadixTooltip.Arrow
                className={clsx(
                  "fill-black dark:fill-zinc-700",
                  arrowClassname,
                )}
              />
            </motion.div>
          </RadixTooltip.Content>
        )}
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  )
}
