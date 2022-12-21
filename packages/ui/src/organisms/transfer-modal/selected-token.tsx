import clsx from "clsx"

type SelectedTokenProps = {
  symbol: string
  icon: string
}

export const SelectedToken: React.FC<SelectedTokenProps> = ({
  symbol,
  icon,
}) => {
  return (
    <div
      className={clsx(
        "flex items-center space-x-2 shrink-0",
        "text-sm font-semibold",
      )}
    >
      <img src={icon} alt="icp" className="w-6" />
      <span>{symbol}</span>
    </div>
  )
}
