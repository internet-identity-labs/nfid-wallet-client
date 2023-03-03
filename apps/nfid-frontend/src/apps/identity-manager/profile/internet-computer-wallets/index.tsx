import React from "react"
import { useParams } from "react-router-dom"
import { useBtcBalance } from "src/features/fungable-token/btc/hooks/use-btc-balance"

import { useBalanceICPAll } from "frontend/features/fungable-token/icp/hooks/use-balance-icp-all"
import TokenWalletsDetailPage from "frontend/ui/pages/new-profile/internet-computer-wallets"

const ProfileTokenWalletsDetailPage = () => {
  const { appAccountBalance } = useBalanceICPAll()
  const { balances: btcSheet } = useBtcBalance()

  const { token } = useParams()
  let balanceSheet
  if (token === "BTC") {
    balanceSheet = btcSheet
  } else {
    balanceSheet =
      token && appAccountBalance ? appAccountBalance[token] : undefined
  }
  console.debug(">> ProfileIWallets", { balanceSheet })

  return <TokenWalletsDetailPage balanceSheet={balanceSheet} />
}

export default ProfileTokenWalletsDetailPage
