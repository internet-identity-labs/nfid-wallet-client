import { memo, FC } from "react"
import { NFIDTheme } from "frontend/App"
import { ProfileTemplate } from "@nfid-frontend/ui"

type VaultsPageProps = {
  walletTheme: NFIDTheme
  setWalletTheme: (theme: NFIDTheme) => void
}

const VaultsPage: FC<VaultsPageProps> = memo(
  ({ walletTheme, setWalletTheme }) => {
    return (
      <ProfileTemplate
        showBackButton
        pageTitle="Vaults"
        className="dark:text-white"
        walletTheme={walletTheme}
        setWalletTheme={setWalletTheme}
      ></ProfileTemplate>
    )
  },
)

export default VaultsPage
