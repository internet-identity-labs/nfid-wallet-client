import clsx from "clsx"

interface CenterEllipsisProps {
  value: string
  trailingChars: number
}

export const CenterEllipsis: React.FC<CenterEllipsisProps> = ({
  value,
  trailingChars,
}) => {
  const splitAt = value.length - trailingChars
  return (
    <div className="flex min-w-0">
      <div
        className={clsx("overflow-hidden overflow-ellipsis whitespace-nowrap")}
      >
        {value.slice(0, splitAt)}
      </div>
      <div className="flex-shrink-0">{value.slice(splitAt)}</div>
    </div>
  )
}
