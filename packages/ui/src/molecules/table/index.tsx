import clsx from "clsx"
import React from "react"

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  tableHeader: JSX.Element
  isActivityTable?: boolean
}

export const Table = ({
  className,
  children,
  tableHeader,
  id,
  isActivityTable,
}: TableProps) => {
  return (
    <table
      id={id}
      className={clsx(
        "w-full text-left",
        className ?? "table-auto",
        isActivityTable ? "min-w-0" : "min-w-[640px]",
      )}
    >
      <thead
        style={{}}
        className={clsx("h-16", isActivityTable ? "h-0 sm:h-16" : "")}
      >
        {tableHeader}
      </thead>
      <tbody>{children}</tbody>
    </table>
  )
}
