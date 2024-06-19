import clsx from "clsx"

import { Balance } from "@nfid/integration"

import { TokenIcon } from "frontend/ui/atoms/token-icon"

interface TokenDetailBalanceProps {
  tokenConfig?: {
    toPresentation: (balance?: bigint) => number | string
  }
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
  tokenConfig,
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
        <div className="text-sm font-semibold" id={"label"}>
          {label}
        </div>
        <div className="text-xs text-secondary" id={"token"}>
          {token}
        </div>
      </div>
      <div className="text-sm font-semibold" id={"token_info"}>
        {tokenBalance && tokenConfig
          ? tokenConfig.toPresentation(tokenBalance)
          : 0}{" "}
        {token}
      </div>
      <div className="text-sm font-semibold">{usdBalance}</div>
    </div>
  )
}
