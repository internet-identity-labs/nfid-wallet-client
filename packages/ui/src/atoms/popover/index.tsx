import * as RadixPopover from "@radix-ui/react-popover"
import clsx from "clsx"
import { ReactElement } from "react"

export interface PopoverProps extends React.HTMLAttributes<HTMLDivElement> {
  trigger: ReactElement
  position?: "top" | "bottom" | "right" | "left"
  align?: "center" | "start" | "end"
}

export const Popover: React.FC<PopoverProps> = ({
  children,
  trigger,
  position,
  align,
}) => {
  return (
    <RadixPopover.Root>
      <RadixPopover.Trigger>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Content side={position} align={align}>
        {children}
      </RadixPopover.Content>
    </RadixPopover.Root>
  )
}
