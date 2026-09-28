import { memo, FC, useCallback } from "react"
import { NFIDTheme } from "frontend/App"
import { ProfileTemplate } from "@nfid-frontend/ui"
import { Vaults } from "packages/ui/src/organisms/vaults"
import { IconCmpRefresh } from "@nfid-frontend/ui"
import { useSWR } from "@nfid/swr"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { nfidVaultsService } from "@nfid/integration"
import { useIdentity } from "frontend/hooks/identity"
import { fetchVaults } from "./utils"
import { useNavigate } from "react-router-dom"

type VaultsPageProps = {
  walletTheme: NFIDTheme
  setWalletTheme: (theme: NFIDTheme) => void
}

const VaultsPage: FC<VaultsPageProps> = memo(
  ({ walletTheme, setWalletTheme }) => {
    const navigate = useNavigate()
    const {
      data: vaults,
      isLoading,
      isValidating,
      mutate,
    } = useSWR("vaults", fetchVaults, {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    })

    const { identity } = useIdentity()

    const getPrice = useCallback(async () => {
      if (!identity) return
      return nfidVaultsService.getPrice(identity)
    }, [identity])

    const createVault = useCallback(
      async (name: string) => {
        if (!identity) return
        const canisterId = await nfidVaultsService.createVault(name, identity)
        mutate()
        navigate(`${ProfileConstants.vaults}/${canisterId.toText()}`)
      },
      [identity, navigate],
    )

    return (
      <ProfileTemplate
        showBackButton
        pageTitle="Vaults"
        className="dark:text-white font-inter"
        walletTheme={walletTheme}
        setWalletTheme={setWalletTheme}
        icon={IconCmpRefresh}
        onIconClick={mutate}
      >
        <p className="text-sm text-gray-800 dark:text-zinc-200">
          Designed to give your blockchain assets the strongest protection
          against loss, theft, and seizure.
        </p>
        <Vaults
          vaults={vaults}
          isLoading={isLoading || isValidating}
          createVault={createVault}
          getPrice={getPrice}
          links={ProfileConstants}
        />
      </ProfileTemplate>
    )
  },
)

export default VaultsPage
