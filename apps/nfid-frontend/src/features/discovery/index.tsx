import { ProfileTemplate } from "@nfid-frontend/ui"
import { Discovery } from "packages/ui/src/organisms/discovery"
import { useSWR } from "@nfid/swr"
import { FC, memo } from "react"
import { NFIDTheme } from "frontend/App"
import { icrc1OracleService } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"

type DiscoveryPageProps = {
  walletTheme: NFIDTheme
  setWalletTheme: (theme: NFIDTheme) => void
}

const DiscoveryPage: FC<DiscoveryPageProps> = memo(
  ({ walletTheme, setWalletTheme }) => {
    const { data: discoveryApps, isLoading } = useSWR(
      "discoveryApps",
      async () => icrc1OracleService.getDiscoveryApps(),
      { revalidateOnFocus: false },
    )

    return (
      <ProfileTemplate
        showBackButton
        pageTitle="Discovery"
        className="dark:text-white"
        walletTheme={walletTheme}
        setWalletTheme={setWalletTheme}
      >
        <Discovery
          discoveryApps={discoveryApps}
          isLoading={isLoading || !discoveryApps}
        />
      </ProfileTemplate>
    )
  },
)

export default DiscoveryPage
