import React from "react"
import clsx from "clsx"
import { Divider } from "frontend/ui-utils/atoms/divider"
import { Button } from "frontend/ui-utils/atoms/button"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  divider?: boolean
  bottom?: boolean
}

export const CardAction: React.FC<Props> = ({
  children,
  className,
  divider = false,
  bottom = false,
}) => {
  return (
    <div className={clsx(bottom && "mt-auto")}>
      {divider && <Divider noGutters />}
      <div
        className={clsx(
          "p-6 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2",
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}
