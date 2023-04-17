import React, { useMemo } from "react"
import { useParams } from "react-router-dom"
import { useBtcBalance } from "src/features/fungable-token/btc/hooks/use-btc-balance"
import { useErc20 } from "src/features/fungable-token/erc-20/hooks/use-erc-20"

import { TokenStandards } from "@nfid/integration/token/types"

import { useEthBalance } from "frontend/features/fungable-token/eth/hooks/use-eth-balances"
import { useBalanceICPAll } from "frontend/features/fungable-token/icp/hooks/use-balance-icp-all"
import TokenWalletsDetailPage from "frontend/ui/pages/new-profile/internet-computer-wallets"

const ProfileTokenWalletsDetailPage = () => {
  const { appAccountBalance } = useBalanceICPAll()
  const { erc20 } = useErc20()
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
        if (appAccountBalance && appAccountBalance[token]) {
          return appAccountBalance[token]
        }
        if (typeof erc20 !== "undefined") {
          return erc20.find((l) => l.token === token)
        }
        return undefined
    }
  }, [appAccountBalance, btcSheet, ethSheet, token, erc20])
  console.debug(">> ProfileIWallets", { balance })

  return <TokenWalletsDetailPage balanceSheet={balance} />
}

export default ProfileTokenWalletsDetailPage
