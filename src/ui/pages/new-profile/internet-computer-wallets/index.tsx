import React from "react"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import ICP from "frontend/assets/dfinity.svg"
import { AppBalance } from "frontend/integration/rosetta/queries"
import { APP_ACC_BALANCE_SHEET } from "frontend/integration/rosetta/queries.mocks"
import { TokenDetailBalance } from "frontend/ui/molecules/token-detail"
import { AppAccountBalanceSheet } from "frontend/ui/organisms/app-acc-balance-sheet"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

interface IProfileTransactionsPage
  extends React.HTMLAttributes<HTMLDivElement> {}

const InternetComputerWalletsPage: React.FC<IProfileTransactionsPage> = () => {
  const apps: AppBalance[] = Object.values(APP_ACC_BALANCE_SHEET.applications)
  return (
    <ProfileTemplate
      pageTitle="Your Internet Computer wallets"
      onBack={`${ProfileConstants.base}/${ProfileConstants.assets}`}
      className="w-full min-w-fit z-[1]"
      containerClassName="overflow-x-auto"
    >
      <TokenDetailBalance
        token="ICP"
        label="Internet Computer"
        icon={ICP}
        tokenBalance={"987.12345678 ICP"}
        usdBalance="$6,526.30"
      />
      <div className="mt-5">
        <AppAccountBalanceSheet apps={apps} />
      </div>
    </ProfileTemplate>
  )
}

export default InternetComputerWalletsPage
