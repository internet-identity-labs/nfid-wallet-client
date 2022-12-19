import clsx from "clsx"

export interface ITableCell extends React.HTMLAttributes<HTMLDivElement> {
  isLeft?: boolean
  isRight?: boolean
}

export const TableCell = ({
  children,
  isLeft,
  isRight,
  className,
}: ITableCell) => {
  return (
    <td
      className={clsx(
        "px-3",
        isLeft && "pl-[10px]",
        isRight && "pr-[10px]",
        className,
      )}
    >
      {children}
    </td>
  )
}
