import * as RadixPopover from "@radix-ui/react-popover"
import clsx from "clsx"

import { Popover, PopoverProps } from "."
import { Button } from "../../molecules/button"

interface IFilterPopover extends PopoverProps {
  title: string
  className?: string
  onReset: () => void
  onApply?: () => void
}

export const FilterPopover = ({
  title,
  onReset,
  onApply,
  children,
  trigger,
  align,
  className,
}: IFilterPopover) => {
  return (
    <Popover className="w-full" trigger={trigger} align={align}>
      <div
        className={clsx(
          "min-w-[350px] relative z-50 bg-white h-full p-2.5 rounded-md shadow-md",
          className,
        )}
      >
        <p className="mb-1 text-xs leading-4">{title}</p>
        {children}
        <div className={onApply ? "grid grid-cols-2 gap-5 mt-5" : "mt-5"}>
          <RadixPopover.Close className="w-full">
            <Button
              onClick={onReset}
              type="ghost"
              block={true}
              id="reset-filters-button"
            >
              Reset filter
            </Button>
          </RadixPopover.Close>
          {onApply && (
            <RadixPopover.Close>
              <Button
                onClick={onApply}
                type="primary"
                id="apply-filters-button"
                block={true}
              >
                Apply
              </Button>
            </RadixPopover.Close>
          )}
        </div>
      </div>
    </Popover>
  )
}
