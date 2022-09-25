import clsx from "clsx"
import { BsArrowDown } from "react-icons/bs"

interface TableData {
  headings: string[]
  rows: React.ReactNode[][]
  sort?: string[]
  reverse?: boolean
  handleSort?: (col: string) => void
  handleReverse?: () => void
}

export default function Table({
  headings,
  rows,
  sort,
  reverse,
  handleSort,
  handleReverse,
}: TableData) {
  const onHeaderClick = (heading: string) => {
    if (!handleReverse || !handleSort) return

    return sort?.includes(heading) && sort?.[0] === heading
      ? handleReverse()
      : handleSort(heading)
  }

  return (
    <table className={clsx("table-auto w-full text-left")}>
      <thead>
        <tr className={clsx("border-b border-gray-900")}>
          {headings.map((heading, i) => (
            <th
              className={clsx(
                "h-16",
                sort?.includes(heading) && "cursor-pointer hover:bg-gray-100",
              )}
              key={`heading_${heading}`}
              onClick={() => onHeaderClick(heading)}
            >
              <div className={clsx("flex gap-2 items-center group")}>
                {heading}
                {sort?.[0] === heading && (
                  <BsArrowDown className={clsx(reverse && "rotate-180")} />
                )}
                {sort?.includes(heading) && sort?.[0] !== heading && (
                  <div className={clsx("invisible group-hover:visible")}>
                    <BsArrowDown />
                  </div>
                )}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={`row_${i}`} className={clsx("border-b border-grey-200")}>
            {row.map((cell, j) => (
              <td className={clsx("h-[85px]")} key={`row_${i}_cell_${j}`}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
