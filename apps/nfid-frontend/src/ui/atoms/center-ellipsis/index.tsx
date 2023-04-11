import clsx from "clsx"
import React from "react"

interface CenterEllipsisProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  value: string
  trailingChars: number
  leadingChars: number
}

export const CenterEllipsis = React.forwardRef<
  HTMLDivElement,
  CenterEllipsisProps
>(({ value, leadingChars, trailingChars, ...divProps }, ref) => {
  const splitAt = value.length - trailingChars
  return (
    <div ref={ref} className="flex min-w-0" {...divProps}>
      <div
        id={"first_part"}
        className={clsx("overflow-hidden whitespace-nowrap")}
      >
        {value.slice(0, leadingChars)}
      </div>
      <div>...</div>
      <div id={"second_part"} className="flex-shrink-0">
        {value.slice(splitAt)}
      </div>
    </div>
  )
})
