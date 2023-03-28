import React, { useMemo } from "react"
import { useParams } from "react-router-dom"
import { useBtcBalance } from "src/features/fungable-token/btc/hooks/use-btc-balance"

import { TokenStandards } from "@nfid/integration/token/types"

import { useEthBalance } from "frontend/features/fungable-token/eth/hooks/use-eth-balances"
import { useBalanceICPAll } from "frontend/features/fungable-token/icp/hooks/use-balance-icp-all"
import TokenWalletsDetailPage from "frontend/ui/pages/new-profile/internet-computer-wallets"

const ProfileTokenWalletsDetailPage = () => {
  const { appAccountBalance } = useBalanceICPAll()
  const { balances: btcSheet } = useBtcBalance()
  const { balance: ethSheet } = useEthBalance()
  const { token } = useParams()

  const balance = useMemo(() => {
    if (!token) return undefined

    switch (token) {
      case TokenStandards.BTC:
        return btcSheet
      case TokenStandards.ETH:
        return ethSheet
      default:
        return appAccountBalance ? appAccountBalance[token] : undefined
    }
  }, [appAccountBalance, btcSheet, ethSheet, token])
  console.debug(">> ProfileIWallets", { balance })

  return <TokenWalletsDetailPage balanceSheet={balance} />
}

export default ProfileTokenWalletsDetailPage
