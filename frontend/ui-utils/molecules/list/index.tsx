import React, { ReactChildren, ReactChild } from "react"
import clsx from "clsx"
import { ListItemHead } from "./list-item-head"
import { Card } from "../card"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const List: React.FC<Props> = ({ children, className }) => {
  return (
    <Card className={className}>
      {children.head}
      <ul className="flex flex-col divide divide-y">{children.items}</ul>
    </Card>
  )
}
