import {
  AppBalance,
  TokenBalanceSheet,
} from "packages/integration/src/lib/asset/types"
import React from "react"

import { useAllToken } from "frontend/features/fungible-token/use-all-token"
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
  const applications = Object.values(balanceSheet.applications).filter(
    (a: AppBalance | undefined): a is AppBalance => !!a,
  )

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
  balanceSheet?: TokenBalanceSheet
  isLoading?: boolean
}

const TokenWalletsDetailPage: React.FC<IProfileTransactionsPage> = ({
  balanceSheet,
  isLoading,
}) => {
  const { token } = useAllToken()
  const apps: AppBalance[] | null = React.useMemo(
    () => getSortedBalanceSheet(balanceSheet),

    [balanceSheet],
  )
  const tokenConfig = React.useMemo(
    () => token.find((t) => t.currency === balanceSheet?.token),
    [token, balanceSheet?.token],
  )

  return (
    <ProfileTemplate
      pageTitle={`Your ${balanceSheet?.label} accounts`}
      className="w-full min-w-fit z-[1]"
      containerClassName="overflow-x-auto"
      showBackButton
      isLoading={isLoading}
    >
      <TokenDetailBalance
        token={balanceSheet?.token || ""}
        tokenConfig={tokenConfig}
        label={balanceSheet?.label || ""}
        icon={balanceSheet?.icon || ""}
        tokenBalance={balanceSheet?.tokenBalance}
        usdBalance={balanceSheet?.usdBalance || ""}
      />
      <div className="mt-5">
        {apps && (
          <AppAccountBalanceSheet
            apps={apps}
            currency={balanceSheet?.token}
            blockchain={balanceSheet?.blockchain}
            toPresentation={tokenConfig?.toPresentation}
          />
        )}
      </div>
    </ProfileTemplate>
  )
}

export default TokenWalletsDetailPage
