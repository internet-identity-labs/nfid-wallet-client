import clsx from "clsx"

export const TableRow = ({
  children,
  className,
  onClick,
}: React.HTMLAttributes<HTMLTableRowElement>) => {
  return (
    <tr
      onClick={onClick}
      className={clsx(
        "border-b border-grey-200 items-center h-16 text-sm",
        onClick && "hover:bg-gray-100 cursor-pointer",
        className,
      )}
    >
      {children}
    </tr>
  )
}
