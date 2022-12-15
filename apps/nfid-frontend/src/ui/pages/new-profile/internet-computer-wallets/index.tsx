import React from "react"

import ICP from "frontend/assets/dfinity.svg"
import {
  AppBalance,
  TokenBalanceSheet,
} from "frontend/features/fungable-token/types"
import { rmProto } from "frontend/integration/identity-manager"
import { TokenDetailBalance } from "frontend/ui/molecules/token-detail"
import { AppAccountBalanceSheet } from "frontend/ui/organisms/app-acc-balance-sheet"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"
import {
  keepStaticOrder,
  sortAlphabetic as alphabetic,
} from "frontend/ui/utils/sorting"

const getSortedBalanceSheet = (balanceSheet?: TokenBalanceSheet) => {
  if (!balanceSheet) return null
  const applications = Object.values(balanceSheet.applications)
  const sortedAlphabetic = applications.sort(
    alphabetic<AppBalance>(({ appName }) => rmProto(appName)),
  )
  const staticOrdered = keepStaticOrder<AppBalance>(
    ({ appName }) => appName,
    ["NFID", "NNS"],
  )(sortedAlphabetic)

  return staticOrdered
}

interface IProfileTransactionsPage
  extends React.HTMLAttributes<HTMLDivElement> {
  icpBlanceSheet?: TokenBalanceSheet
}

const InternetComputerWalletsPage: React.FC<IProfileTransactionsPage> = ({
  icpBlanceSheet,
}) => {
  const apps: AppBalance[] | null = React.useMemo(
    () => getSortedBalanceSheet(icpBlanceSheet),

    [icpBlanceSheet],
  )
  return (
    <ProfileTemplate
      pageTitle="Your Internet Computer wallets"
      className="w-full min-w-fit z-[1]"
      containerClassName="overflow-x-auto"
      showBackButton
    >
      <TokenDetailBalance
        token={icpBlanceSheet?.token || ""}
        label={icpBlanceSheet?.label || ""}
        icon={icpBlanceSheet?.icon || ""}
        tokenBalance={icpBlanceSheet?.tokenBalance}
        usdBalance={icpBlanceSheet?.usdBalance || ""}
      />
      <div className="mt-5">
        {apps && (
          <AppAccountBalanceSheet
            apps={apps}
            currency={icpBlanceSheet?.token}
          />
        )}
      </div>
    </ProfileTemplate>
  )
}

export default InternetComputerWalletsPage
