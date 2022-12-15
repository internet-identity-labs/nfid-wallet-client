import clsx from "clsx"

import { Balance } from "@nfid/integration"
import { toPresentation } from "@nfid/integration/token/icp"

import { TokenIcon } from "frontend/ui/atoms/token-icon"

interface TokenDetailBalanceProps {
  token: string
  label: string
  icon: string
  tokenBalance?: Balance
  usdBalance: string
}

export const TokenDetailBalance: React.FC<TokenDetailBalanceProps> = ({
  token,
  label,
  icon,
  tokenBalance,
  usdBalance,
}) => {
  return (
    <div
      className={clsx(
        "h-20 border border-gray-200 rounded-xl",
        "px-6",
        "flex items-center space-x-6",
      )}
    >
      <div>
        <TokenIcon src={icon} token={token} />
      </div>
      <div className="flex-grow">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-gray-400">{token}</div>
      </div>
      <div className="text-sm font-semibold">
        {tokenBalance ? toPresentation(tokenBalance) : 0} {token}
      </div>
      <div className="text-sm font-semibold">{usdBalance}</div>
    </div>
  )
}
