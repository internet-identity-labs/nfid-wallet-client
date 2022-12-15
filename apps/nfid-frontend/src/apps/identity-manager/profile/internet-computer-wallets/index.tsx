import React from "react"

import { useBalanceICPAll } from "frontend/features/fungable-token/icp/hooks/use-balance-icp-all"
import InternetComputerWalletsPage from "frontend/ui/pages/new-profile/internet-computer-wallets"

const ProfileInternetComputerWallets = () => {
  const { appAccountBalance } = useBalanceICPAll()
  console.log(">> ProfileInternetComputerWallets", { appAccountBalance })

  return <InternetComputerWalletsPage icpBlanceSheet={appAccountBalance} />
}

export default ProfileInternetComputerWallets
