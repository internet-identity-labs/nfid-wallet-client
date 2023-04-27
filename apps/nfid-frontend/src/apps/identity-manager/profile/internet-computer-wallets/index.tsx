import React, { useMemo } from "react"
import { useParams } from "react-router-dom"
import { getAssetDetailsTokens } from "src/ui/view-model/fungible-asset-details/fungible-asset-details-factory"
import { useAssetDetails } from "src/ui/view-model/fungible-asset-details/hooks/use-account-config"

import { useBalanceICPAll } from "frontend/features/fungable-token/icp/hooks/use-balance-icp-all"
import TokenWalletsDetailPage from "frontend/ui/pages/new-profile/internet-computer-wallets"

const ProfileTokenWalletsDetailPage = () => {
  const { appAccountBalance } = useBalanceICPAll()
  const tokens = getAssetDetailsTokens()
  const assets = tokens.map(useAssetDetails)
  let details = assets.flatMap((details) => details.assets ?? [])
  const { token } = useParams()

  const balance = useMemo(() => {
    if (!token) return undefined
    if (details) return details.find((l) => l.token === token)
    if (appAccountBalance && appAccountBalance[token]) {
      return appAccountBalance[token]
    }
  }, [appAccountBalance, token, details])
  console.debug(">> ProfileIWallets", { balance })

  return <TokenWalletsDetailPage balanceSheet={balance} />
}

export default ProfileTokenWalletsDetailPage
