import React from "react"
import { useParams } from "react-router-dom"

import { useBalanceICPAll } from "frontend/features/fungable-token/icp/hooks/use-balance-icp-all"
import InternetComputerWalletsPage from "frontend/ui/pages/new-profile/internet-computer-wallets"

const ProfileInternetComputerWallets = () => {
  const { appAccountBalance } = useBalanceICPAll()
  const { token } = useParams()
  console.log(">> ProfileInternetComputerWallets", { appAccountBalance })

  return (
    <InternetComputerWalletsPage
      balanceSheet={
        token && appAccountBalance ? appAccountBalance[token] : undefined
      }
    />
  )
}

export default ProfileInternetComputerWallets
