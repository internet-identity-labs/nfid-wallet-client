import React, { useMemo } from "react"
import { useParams } from "react-router-dom"
import { useBtcBalance } from "src/features/fungable-token/btc/hooks/use-btc-balance"
import { useErc20 } from "src/features/fungable-token/erc-20/hooks/use-erc-20"
import { useErc20Polygon } from "src/features/fungable-token/erc-20/hooks/use-erc-20-polygon"
import { useMaticBalance } from "src/features/fungable-token/matic/hooks/use-matic-balance"

import { TokenStandards } from "@nfid/integration/token/types"

import { useEthBalance } from "frontend/features/fungable-token/eth/hooks/use-eth-balances"
import { useBalanceICPAll } from "frontend/features/fungable-token/icp/hooks/use-balance-icp-all"
import TokenWalletsDetailPage from "frontend/ui/pages/new-profile/internet-computer-wallets"

const ProfileTokenWalletsDetailPage = () => {
  const { appAccountBalance } = useBalanceICPAll()
  const { erc20: erc20Ethereum } = useErc20()
  const { erc20: erc20Polygon } = useErc20Polygon()
  const { balances: btcSheet } = useBtcBalance()
  const { balances: matic } = useMaticBalance()
  const { balance: ethSheet } = useEthBalance()
  const { token } = useParams()

  const balance = useMemo(() => {
    if (!token) return undefined

    switch (token) {
      case TokenStandards.BTC:
        return btcSheet
      case TokenStandards.ETH:
        return ethSheet
      case TokenStandards.MATIC:
        return matic
      default:
        if (appAccountBalance && appAccountBalance[token]) {
          return appAccountBalance[token]
        }
        if (typeof erc20Polygon !== "undefined") {
          const polygonToken = erc20Polygon.find((l) => l.token === token)
          if (polygonToken) {
            return polygonToken
          }
        }
        if (typeof erc20Ethereum !== "undefined") {
          return erc20Ethereum.find((l) => l.token === token)
        }
        return undefined
    }
  }, [
    appAccountBalance,
    btcSheet,
    ethSheet,
    token,
    erc20Ethereum,
    erc20Polygon,
    matic,
  ])
  console.debug(">> ProfileIWallets", { balance })

  return <TokenWalletsDetailPage balanceSheet={balance} />
}

export default ProfileTokenWalletsDetailPage
