import { CopyAddress } from "@nfid-frontend/ui"
import React from "react"

interface WalletConnectTransactionDataProps {
  address: string
  token: string
}

export const WalletConnectTransactionData: React.FC<
  WalletConnectTransactionDataProps
> = ({ address, token }) => (
  <div className="absolute top-[18px] right-[30px] text-right">
    <CopyAddress
      className="text-xs font-bold leading-[18px] dark:text-white"
      address={address || ""}
      leadingChars={6}
      trailingChars={4}
      iconClassName="absolute right-[100%] mr-[3px]"
    />
    <span className="text-xs text-gray-500 dark:text-zinc-400 leading-[18px] block">
      {token}
    </span>
  </div>
)
