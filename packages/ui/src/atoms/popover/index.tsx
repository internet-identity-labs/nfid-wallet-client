import * as RadixPopover from "@radix-ui/react-popover"
import { ReactElement } from "react"

export interface PopoverProps extends React.HTMLAttributes<HTMLDivElement> {
  trigger: ReactElement
  position?: "top" | "bottom" | "right" | "left"
  align?: "center" | "start" | "end"
  className?: string
}

export const Popover: React.FC<PopoverProps> = ({
  children,
  trigger,
  position,
  align,
  className,
}) => {
  return (
    <RadixPopover.Root>
      <RadixPopover.Trigger className={className}>
        {trigger}
      </RadixPopover.Trigger>
      <RadixPopover.Content side={position} align={align} className="!z-30">
        {children}
      </RadixPopover.Content>
    </RadixPopover.Root>
  )
}
