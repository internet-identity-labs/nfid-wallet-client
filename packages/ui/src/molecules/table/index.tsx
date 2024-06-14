import clsx from "clsx"
import React from "react"

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  tableHeader: JSX.Element
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
      className={clsx(
        "w-full text-left",
        className ?? "table-auto",
        theadClassName ? "min-w-0" : "min-w-[640px]",
      )}
    >
      <thead className={clsx("h-16", theadClassName)}>{tableHeader}</thead>
      <tbody>{children}</tbody>
    </table>
  )
}
