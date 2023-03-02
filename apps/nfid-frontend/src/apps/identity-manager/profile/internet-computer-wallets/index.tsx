import React from "react"
import { useParams } from "react-router-dom"
import { useBtcBalance } from "src/features/fungable-token/btc/hooks/use-btc-balance"

import { useBalanceICPAll } from "frontend/features/fungable-token/icp/hooks/use-balance-icp-all"
import TokenWalletsDetailPage from "frontend/ui/pages/new-profile/internet-computer-wallets"

const ProfileTokenWalletsDetailPage = () => {
  const { appAccountBalance } = useBalanceICPAll()
  const { balances: btcSheet } = useBtcBalance()

  const { token } = useParams()
  let balanceSheet =
    token && appAccountBalance ? appAccountBalance[token] : undefined
  if (token === "BTC") {
    balanceSheet = btcSheet
  }
  console.log(">> ProfileIWallets", { balanceSheet })

  return <TokenWalletsDetailPage balanceSheet={balanceSheet} />
}

export default ProfileTokenWalletsDetailPage
