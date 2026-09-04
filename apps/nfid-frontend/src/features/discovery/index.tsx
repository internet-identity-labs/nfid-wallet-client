import { ProfileTemplate } from "@nfid-frontend/ui"
import { Discovery } from "packages/ui/src/organisms/discovery"
import { useSWR } from "@nfid/swr"
import { FC, memo, useContext } from "react"
import { NFIDTheme } from "frontend/App"
import { icrc1OracleService } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"
import { promotionService } from "@nfid/integration/promotion"
import { ModalType } from "../transfer-modal/types"
import { useActor } from "@xstate/react"
import { ProfileContext } from "frontend/provider"

type DiscoveryPageProps = {
  walletTheme: NFIDTheme
  setWalletTheme: (theme: NFIDTheme) => void
}

const DiscoveryPage: FC<DiscoveryPageProps> = memo(
  ({ walletTheme, setWalletTheme }) => {
    const { transferService } = useContext(ProfileContext)
    const [, send] = useActor(transferService)

    const { data: discoveryApps, isLoading } = useSWR(
      "discoveryApps",
      async () => icrc1OracleService.getDiscoveryApps(),
      { revalidateOnFocus: false },
    )

    const { data: promotionStatus, isLoading: isPromotionStatusLoading } =
      useSWR("promotionStatus", async () => promotionService.getStatus(), {
        revalidateOnFocus: false,
      })

    const onPromoteClick = (dappId: number) => {
      send({ type: "ASSIGN_VAULTS", data: false })
      send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
      send({ type: "CHANGE_DIRECTION", data: ModalType.PROMOTE })
      send({ type: "ASSIGN_SELECTED_DAPP", data: dappId })
      send("SHOW")
    }

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
          isLoading={isLoading || isPromotionStatusLoading}
          onPromoteClick={onPromoteClick}
          promotionStatus={promotionStatus}
        />
      </ProfileTemplate>
    )
  },
)

export default DiscoveryPage
