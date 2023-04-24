import * as RadixPopover from "@radix-ui/react-popover"

import { Popover, PopoverProps } from "."
import { Button } from "../../molecules/button"

interface IFilterPopover extends PopoverProps {
  onReset: () => void
  onApply?: () => void
}

export const FilterPopover = ({
  onReset,
  onApply,
  children,
  trigger,
  align,
}: IFilterPopover) => {
  return (
    <Popover trigger={trigger} align={align}>
      <div className="min-w-[350px] relative z-50 bg-white h-full p-2.5 rounded-md shadow-md">
        <p className="text-sm font-bold">Filter</p>
        {children}
        <div className="grid grid-cols-2 gap-5 mt-4">
          <RadixPopover.Close>
            <Button
              onClick={onReset}
              type="stroke"
              block={true}
              id="reset-filters-button"
            >
              Reset filter
            </Button>
          </RadixPopover.Close>
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
        </div>
      </div>
    </Popover>
  )
}
