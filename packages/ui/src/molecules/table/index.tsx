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

export const TableWrapper = ({
  children,
  className,
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx("overflow-x-auto w-full", className)}>{children}</div>
)

export const TableBase = ({
  children,
  className,
}: React.HTMLAttributes<HTMLTableElement>) => (
  <table className={clsx("w-full text-left min-w-[640px]", className)}>
    {children}
  </table>
)

export interface TableHeadProps {
  headings: string[]
  className?: string
}

export const TableHead = ({ headings, className }: TableHeadProps) => (
  <thead className={clsx("h-16", className)}>
    <tr>
      {headings.map((h) => (
        <th key={h} className="px-4 font-semibold text-sm">
          {h}
        </th>
      ))}
    </tr>
  </thead>
)
