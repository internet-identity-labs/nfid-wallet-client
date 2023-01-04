import clsx from "clsx"
import React from "react"

import { TableBody } from "./tbody"
import { TableHead } from "./thead"

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  headings: string[]
  rows: { val: React.ReactNode[]; key: string }[]
  sort?: string[]
  reverse?: boolean
  handleHeaderClick?: (col: string) => void
}

export default function Table({
  headings,
  rows,
  sort,
  reverse,
  handleHeaderClick,
  className,
}: TableProps) {
  return (
    <table
      className={clsx(
        "w-full text-left min-w-[640px]",
        className ?? "table-auto",
      )}
    >
      <TableHead
        headings={headings}
        sort={sort}
        reverse={reverse}
        handleHeaderClick={handleHeaderClick}
      />
      <TableBody rows={rows} headings={headings} />
    </table>
  )
}
