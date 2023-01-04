import clsx from "clsx"

export interface ITableRow extends React.HTMLAttributes<HTMLTableRowElement> {
  header?: boolean
}

export const TableRow = ({
  children,
  className,
  onClick,
  header,
}: ITableRow) => {
  return (
    <tr
      onClick={onClick}
      className={clsx(
        "border-b border-grey-200 items-center h-16 text-sm last:border-0",
        header && "border-b-black !border-b font-bold",
        onClick && "hover:bg-gray-100 cursor-pointer",
        className,
      )}
    >
      {children}
    </tr>
  )
}
