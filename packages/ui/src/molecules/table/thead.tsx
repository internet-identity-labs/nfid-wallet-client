import clsx from "clsx"
import { BsArrowDown } from "react-icons/bs"

export const TableHead: React.FC<{
  headings: string[]
  sort?: string[]
  reverse?: boolean
  handleHeaderClick?: (col: string) => void
}> = ({ sort, reverse, headings, handleHeaderClick }) => (
  <thead>
    <tr className={clsx(`border-b border-gray-900`)}>
      {headings.map((heading, i) => (
        <th
          className={clsx(
            "h-16 px-3",
            i === 0 && "pl-[10px]",
            i === heading.length - 1 && "pr-[10px]",
            sort?.includes(heading) && "cursor-pointer hover:bg-gray-100",
          )}
          key={`heading${heading}`}
          onClick={() => handleHeaderClick && handleHeaderClick(heading)}
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
