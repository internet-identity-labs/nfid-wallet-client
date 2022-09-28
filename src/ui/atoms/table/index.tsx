import clsx from "clsx"
import { BsArrowDown } from "react-icons/bs"

interface TableData {
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
}: TableData) {
  return (
    <div className={clsx(`overflow-x-scroll`)}>
      <table className={clsx(`table-auto w-full text-left min-w-[640px]`)}>
        <thead>
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
                onClick={() => handleHeaderClick && handleHeaderClick(heading)}
              >
                <div
                  className={clsx(
                    `flex gap-2 items-center group whitespace-nowrap`,
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
        <tbody>
          {rows.map((row, j) => (
            <tr
              key={`row${row.key}`}
              className={clsx(`border-b border-grey-200`)}
            >
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
      </table>
    </div>
  )
}
