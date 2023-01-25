import clsx from "clsx"

interface ITransactionInfoRow {
  title: JSX.Element | string
  content?: JSX.Element | string
  titleClassName?: string
}

export const TransactionInfoRow = ({
  title,
  content,
  titleClassName,
}: ITransactionInfoRow) => {
  return (
    <div
      className={clsx(
        "grid grid-cols-[160px,1fr] w-full text-sm",
        "border-b-[1px] border-gray-100 min-h-[48px]",
        "items-center py-1",
      )}
    >
      <div className={clsx("text-secondary", titleClassName)}>{title}</div>
      <div>{content}</div>
    </div>
  )
}
