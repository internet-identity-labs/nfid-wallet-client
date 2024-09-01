import clsx from "clsx"
import React from "react"

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  tableHeader?: JSX.Element
  theadClassName?: string
}

export const Table = ({
  className,
  children,
  tableHeader,
  id,
  theadClassName,
}: TableProps) => {
  return (
    <table
      id={id}
      className={clsx("w-full text-left min-w-[640px]", className)}
    >
      {tableHeader && (
        <thead className={clsx("h-16", theadClassName)}>{tableHeader}</thead>
      )}
      <tbody className="relative">{children}</tbody>
    </table>
  )
}
