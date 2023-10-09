import clsx from "clsx"

export type TokenOptionProps = {
  isSelected: boolean
  value: string
  icon: string
}

export const TokenOption: React.FC<TokenOptionProps> = ({
  value,
  icon,
  isSelected,
}) => {
  return (
    <div
      className={clsx(
        "flex items-center space-x-2 shrink-0 p-2 hover:cursor-pointer",
        "text-sm font-semibold border border-transparent",
        isSelected && "bg-gray-100",
      )}
    >
      <img src={icon} alt={`icon-${value}`} className="w-6" />
      <span>{value}</span>
    </div>
  )
}
