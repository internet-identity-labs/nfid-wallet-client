import clsx from "clsx"
import React, { ReactNode } from "react"
import { BsArrowDown } from "react-icons/bs"

interface TableData {
  headings: string[]
  rows: { val: React.ReactNode[]; key: string }[]
  sort?: string[]
  reverse?: boolean
  handleHeaderClick?: (col: string) => void
}

export const TableWrapper: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => <div className={clsx("overflow-x-scroll")}>{children}</div>

export const TableBase: React.FC<{
  children: ReactNode[] | ReactNode
  className?: string
}> = ({ children, className }) => (
  <table
    className={clsx(
      "w-full text-left min-w-[640px]",
      className ?? "table-auto",
    )}
  >
    {children}
  </table>
)

export const TableHead: React.FC<{
  headings: string[]
  sort?: string[]
  reverse?: boolean
  handleHeaderClick?: (col: string) => void
}> = ({ sort, reverse, headings, handleHeaderClick }) => (
  <thead className="contents">
    <tr className={clsx(`border-b border-gray-900`)}>
      {headings.map((heading, i) => (
        <th
          className={clsx(
            "h-16 px-3",
            i === 0 && "pl-[30px]",
            i === heading.length - 1 && "pr-[30px]",
            sort?.includes(heading) && "cursor-pointer hover:bg-gray-100",
          )}
          key={`heading${heading}`}
          onClick={() => handleHeaderClick?.(heading)}
        >
          <div
            className={clsx(
              `flex h-full gap-2 items-center group whitespace-nowrap`,
            )}
          >
            {heading}
            {sort?.[0] === heading && (
              <BsArrowDown className={clsx(reverse && `rotate-180`)} />
            )}
            {sort?.includes(heading) && sort?.[0] !== heading && (
              <div className={clsx(`invisible group-hover:visible`)}>
                <BsArrowDown />
              </div>
            )}
          </div>
        </th>
      ))}
    </tr>
  </thead>
)

export const TableBody: React.FC<{
  rows: { val: React.ReactNode[]; key: string }[]
  headings: string[]
}> = ({ rows, headings }) => (
  <tbody>
    {rows.map((row) => (
      <tr key={`row${row.key}`} className={clsx(`border-b border-grey-200`)}>
        {row.val.map((cell, i) => (
          <td
            className={clsx(
              "h-[85px] px-3",
              i === 0 && "pl-[30px]",
              i === row.val.length - 1 && "pr-[30px]",
            )}
            key={`row${row.key}cell${headings[i]}`}
          >
            {cell}
          </td>
        ))}
      </tr>
    ))}
  </tbody>
)

export default function Table({
  headings,
  rows,
  sort,
  reverse,
  handleHeaderClick,
}: TableData) {
  return (
    <TableWrapper>
      <TableBase>
        <TableHead
          headings={headings}
          sort={sort}
          reverse={reverse}
          handleHeaderClick={handleHeaderClick}
        />
        <TableBody rows={rows} headings={headings} />
      </TableBase>
    </TableWrapper>
  )
}
