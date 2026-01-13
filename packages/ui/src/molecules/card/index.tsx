import clsx from "clsx"
import React from "react"

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  classNames?: string
  text?: React.ReactNode
  title?: string
}

export { CardBody } from "./body"

export const Card: React.FC<Props> = ({
  children,
  className,
  classNames,
  text,
  title,
  ...props
}) => {
  const content = text || children
  const classes = classNames || className

  return (
    <div className={clsx(classes, "rounded-md")} {...props}>
      {title && <div className="font-semibold mb-2">{title}</div>}
      {content}
    </div>
  )
}
