import * as RadixPopover from "@radix-ui/react-popover"
import clsx from "clsx"

import { Popover, PopoverProps } from "."
import { Button } from "../../molecules/button"

interface IFilterPopover extends PopoverProps {
  title: string
  className?: string
  hasApplyBtn?: boolean
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
  hasApplyBtn,
}: IFilterPopover) => {
  return (
    <Popover trigger={trigger} align={align}>
      <div
        className={clsx(
          "min-w-[350px] relative z-50 bg-white h-full p-2.5 rounded-md shadow-md",
          className,
        )}
      >
        <p className="text-sm font-bold">{title}</p>
        {children}
        <div className={hasApplyBtn ? "grid grid-cols-2 gap-5 mt-4" : "mt-4"}>
          <RadixPopover.Close className="w-full">
            <Button
              onClick={onReset}
              type="stroke"
              block={true}
              id="reset-filters-button"
            >
              Reset filter
            </Button>
          </RadixPopover.Close>
          {hasApplyBtn && (
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
