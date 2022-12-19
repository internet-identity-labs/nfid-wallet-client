import clsx from "clsx"
import React from "react"

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  tableHeader: JSX.Element
}

export default function Table({
  className,
  children,
  tableHeader,
}: TableProps) {
  return (
    <table
      className={clsx(
        "w-full text-left min-w-[640px]",
        className ?? "table-auto",
      )}
    >
      <thead className="h-16">{tableHeader}</thead>
      <tbody>{children}</tbody>
    </table>
  )
}
