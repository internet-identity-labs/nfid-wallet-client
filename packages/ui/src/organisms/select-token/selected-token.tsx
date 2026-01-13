import clsx from "clsx"

import { IconSvgChevron } from "@nfid/ui/atoms/icons"

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
      <div>
        <img src={icon} alt={`icon-${symbol}`} width={45} height={45} />
      </div>
      <div>{symbol}</div>
      <div>
        <img src={IconSvgChevron} alt={`icon-chevron`} width={20} height={20} />
      </div>
    </div>
  )
}
