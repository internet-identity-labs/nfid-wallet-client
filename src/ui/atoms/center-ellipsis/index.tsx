import clsx from "clsx"

interface CenterEllipsisProps {
  value: string
  trailingChars: number
  leadingChars: number
}

export const CenterEllipsis: React.FC<CenterEllipsisProps> = ({
  value,
  leadingChars,
  trailingChars,
}) => {
  const splitAt = value.length - trailingChars
  return (
    <div className="flex min-w-0">
      <div className={clsx("overflow-hidden whitespace-nowrap")}>
        {value.slice(0, leadingChars)}
      </div>
      <div>...</div>
      <div className="flex-shrink-0">{value.slice(splitAt)}</div>
    </div>
  )
}
