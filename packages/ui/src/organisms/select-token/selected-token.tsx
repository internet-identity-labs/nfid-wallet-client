import clsx from "clsx"

import { IconSvgChevron } from "../../atoms/icons"

export type SelectedTokenProps = {
  symbol: string
  icon: string
}

export const SelectedToken: React.FC<SelectedTokenProps> = ({
  symbol,
  icon,
}) => {
  return (
    <div
      className={clsx("flex items-center space-x-2", "text-sm font-semibold")}
    >
      <img src={icon} alt={`icon-${symbol}`} className="w-6 h-6" />
      <span>{symbol}</span>
      <img src={IconSvgChevron} alt={`icon-chevron`} />
    </div>
  )
}
