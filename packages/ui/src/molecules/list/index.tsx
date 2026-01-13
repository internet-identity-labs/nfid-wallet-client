import React from "react"

import { Card } from "../card"

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactElement[] | JSX.Element[] | React.ReactNode
}

const Header: React.FC<Props> = ({ children }: Props) => {
  return <>{children}</>
}

const Items: React.FC<Props> = ({ children }: Props) => {
  return <>{children}</>
}

interface ListCompoundProps {
  Header: React.FC<Props>
  Items: React.FC<Props>
}

export const List: React.FC<Props> & ListCompoundProps = ({
  children,
  className,
}: Props) => {
  const header: React.ReactNode[] = []
  const items: React.ReactNode[] = []

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) {
      items.push(child)
      return
    }

    if (child.type === Header) {
      header.push(child)
      return
    }

    items.push(child)
  })

  return (
    <Card className={className}>
      {header}
      <div className="flex flex-col">{items}</div>
    </Card>
  )
}

List.Header = Header
List.Items = Items
