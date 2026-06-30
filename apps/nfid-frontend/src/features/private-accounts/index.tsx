import { ProfileTemplate } from "@nfid-frontend/ui"
import { PrivateAccounts } from "packages/ui/src/organisms/private-accounts"
import { useSWR } from "@nfid/swr"
import { FC, memo, useMemo } from "react"
import { NFIDTheme } from "frontend/App"
import { icrc1OracleService } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"

type PrivateAccountsPageProps = {
  walletTheme: NFIDTheme
  setWalletTheme: (theme: NFIDTheme) => void
}

const PrivateAccountsPage: FC<PrivateAccountsPageProps> = memo(
  ({ walletTheme, setWalletTheme }) => {
    const { data: privateAccounts, isLoading: myAppsLoading } = useSWR(
      "privateAccounts",
      async () => icrc1OracleService.getMyDiscoveryApps(),
      { revalidateOnFocus: false },
    )

    const { data: discoveryApps, isLoading: appsLoading } = useSWR(
      "discoveryApps",
      async () => icrc1OracleService.getDiscoveryApps(),
      { revalidateOnFocus: false },
    )

    const filteredApps = useMemo(() => {
      if (!privateAccounts || !discoveryApps) return
      const ids = privateAccounts.map((app) => app.appId)

      return discoveryApps.filter((app) => ids.includes(app.id))
    }, [discoveryApps, privateAccounts])

    return (
      <ProfileTemplate
        showBackButton
        pageTitle="Private accounts"
        pageDescription="View your asset balances across connected applications. This dashboard tracks which dApps you have visited and displays the isolated balances tied securely to those specific, private addresses."
        className="dark:text-white"
        walletTheme={walletTheme}
        setWalletTheme={setWalletTheme}
      >
        <PrivateAccounts
          privateAccounts={filteredApps}
          isLoading={myAppsLoading || appsLoading}
          links={ProfileConstants}
        />
      </ProfileTemplate>
    )
  },
)

export default PrivateAccountsPage
