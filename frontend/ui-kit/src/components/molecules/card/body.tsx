import React from "react"
import clsx from "clsx"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  small?: boolean
}

export const CardBody: React.FC<Props> = ({
  children,
  className,
  small = false,
}) => {
  return (
    <div
      className={clsx(className, "py-6", small && "2xl:max-w-xl xl:max-w-lg")}
    >
      {children}
    </div>
  )
}
