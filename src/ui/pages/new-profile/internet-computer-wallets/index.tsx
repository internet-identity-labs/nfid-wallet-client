import React from "react"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import ICP from "frontend/assets/dfinity.svg"
import { rmProto } from "frontend/integration/identity-manager"
import {
  AppBalance,
  ICPBalanceSheet,
} from "frontend/integration/rosetta/hooks/use-balance-icp-all"
import { TokenDetailBalance } from "frontend/ui/molecules/token-detail"
import { AppAccountBalanceSheet } from "frontend/ui/organisms/app-acc-balance-sheet"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

const getSortedBalanceSheet = (balanceSheet: ICPBalanceSheet | null) => {
  if (!balanceSheet) return null
  const applications = Object.values(balanceSheet.applications)
  const NFID = applications.find((app) => app.appName === "NFID")
  const NNS = applications.find((app) => app.appName === "NNS")

  return [
    ...(NFID ? [NFID] : []),
    ...(NNS ? [NNS] : []),
    ...applications
      .filter((a) => Boolean(a) && a.appName !== "NFID" && a.appName !== "NNS")
      .sort((a, b) => {
        return rmProto(a.appName).localeCompare(rmProto(b.appName), "en", {
          sensitivity: "base",
        })
      }),
  ]
}

interface IProfileTransactionsPage
  extends React.HTMLAttributes<HTMLDivElement> {
  icpBlanceSheet: ICPBalanceSheet | null
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
      onBack={`${ProfileConstants.base}/${ProfileConstants.assets}`}
      className="w-full min-w-fit z-[1]"
      containerClassName="overflow-x-auto"
    >
      <TokenDetailBalance
        token={icpBlanceSheet?.token || ""}
        label={icpBlanceSheet?.label || ""}
        icon={ICP}
        tokenBalance={icpBlanceSheet?.icpBalance || ""}
        usdBalance={icpBlanceSheet?.usdBalance || ""}
      />
      <div className="mt-5">
        {apps && <AppAccountBalanceSheet apps={apps} />}
      </div>
    </ProfileTemplate>
  )
}

export default InternetComputerWalletsPage
