import React, { useMemo } from "react"
import { useParams } from "react-router-dom"
import { fungibleAssetDetailsFactory } from "src/ui/connnector/fungible-asset-details/fungible-asset-details-factory"
import { useAssetDetails } from "src/ui/connnector/fungible-asset-details/hooks/use-account-config"

import { useBalanceICPAll } from "frontend/features/fungable-token/icp/hooks/use-balance-icp-all"
import TokenWalletsDetailPage from "frontend/ui/pages/new-profile/internet-computer-wallets"

const ProfileTokenWalletsDetailPage = () => {
  const { appAccountBalance } = useBalanceICPAll()
  const tokens = fungibleAssetDetailsFactory.getKeys()
  const { assets: details } = useAssetDetails({ tokens })

  const { token } = useParams()

  const balance = useMemo(() => {
    if (!token) return undefined
    if (appAccountBalance && appAccountBalance[token]) {
      return appAccountBalance[token]
    }
    if (details) {
      return details.find((l) => l.token === token)
    }
  }, [appAccountBalance, token, details])
  console.debug(">> ProfileIWallets", { balance })

  return <TokenWalletsDetailPage balanceSheet={balance} />
}

export default ProfileTokenWalletsDetailPage
