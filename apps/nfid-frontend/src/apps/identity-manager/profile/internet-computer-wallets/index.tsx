import React from "react"
import { useParams } from "react-router-dom"

import { useBalanceICPAll } from "frontend/features/fungable-token/icp/hooks/use-balance-icp-all"
import TokenWalletsDetailPage from "frontend/ui/pages/new-profile/internet-computer-wallets"

const ProfileTokenWalletsDetailPage = () => {
  const { appAccountBalance } = useBalanceICPAll()
  const { token } = useParams()
  console.log(">> ProfileInternetComputerWallets", { appAccountBalance })

  return (
    <TokenWalletsDetailPage
      balanceSheet={
        token && appAccountBalance ? appAccountBalance[token] : undefined
      }
    />
  )
}

export default ProfileTokenWalletsDetailPage
