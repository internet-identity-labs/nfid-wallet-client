import React, { useMemo } from "react"
import { useParams } from "react-router-dom"
import { useBtcBalance } from "src/features/fungable-token/btc/hooks/use-btc-balance"

import { TokenStandards } from "@nfid/integration/token/types"

import { useBalanceICPAll } from "frontend/features/fungable-token/icp/hooks/use-balance-icp-all"
import TokenWalletsDetailPage from "frontend/ui/pages/new-profile/internet-computer-wallets"

const ProfileTokenWalletsDetailPage = () => {
  const { appAccountBalance } = useBalanceICPAll()
  const { balances: btcSheet } = useBtcBalance()

  const { token } = useParams()
  const balance = useMemo(() => {
    if (!token) return undefined

    switch (token) {
      case TokenStandards.BTC:
        return btcSheet
      default:
        return appAccountBalance ? appAccountBalance[token] : undefined
    }
  }, [appAccountBalance, btcSheet, token])
  console.debug(">> ProfileIWallets", { balance })

  return <TokenWalletsDetailPage balanceSheet={balance} />
}

export default ProfileTokenWalletsDetailPage
