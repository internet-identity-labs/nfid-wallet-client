import clsx from "clsx"

export const TableBody: React.FC<{
  rows: { val: React.ReactNode[]; key: string }[]
  headings: string[]
}> = ({ rows, headings }) => (
  <tbody>
    {rows.map((row, j) => (
      <tr key={`row${row.key}`} className={clsx(`border-b border-grey-200`)}>
        {row.val.map((cell, i) => (
          <td
            className={clsx(
              "h-16 px-3",
              i === 0 && "pl-[10px]",
              i === row.val.length - 1 && "pr-[10px]",
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
