import { memo, FC, useCallback, useState } from "react"
import { NFIDTheme } from "frontend/App"
import { ProfileTemplate } from "@nfid-frontend/ui"
import { Vaults } from "packages/ui/src/organisms/vaults"
import { IconCmpRefresh } from "@nfid-frontend/ui"
import { useSWR } from "@nfid/swr"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { nfidVaultsService } from "@nfid/integration"
import { AccountIdentifier } from "@icp-sdk/canisters/ledger/icp"
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
    const { identity } = useIdentity()
    const [isRefreshing, setIsRefreshing] = useState(false)
    const principal = identity?.getPrincipal()

    const {
      data: vaults,
      isLoading,
      isValidating,
      mutate,
    } = useSWR(
      principal ? ["vaults", principal.toText()] : null,
      () => fetchVaults(principal!),
      { revalidateOnFocus: false },
    )

    const getPrice = useCallback(async () => {
      if (!identity) return
      return nfidVaultsService.getPrice(identity)
    }, [identity])

    const handleRefresh = useCallback(async () => {
      if (!principal) return
      const address = AccountIdentifier.fromPrincipal({ principal }).toHex()
      setIsRefreshing(true)
      try {
        await nfidVaultsService.updateDashboardCache(address)
        await mutate()
      } finally {
        setIsRefreshing(false)
      }
    }, [principal, mutate])

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
        onIconClick={handleRefresh}
      >
        <p className="text-sm text-gray-800 dark:text-zinc-200">
          Designed to give your blockchain assets the strongest protection
          against loss, theft, and seizure.
        </p>
        <Vaults
          vaults={vaults}
          isLoading={isLoading || isValidating || isRefreshing}
          createVault={createVault}
          getPrice={getPrice}
          links={ProfileConstants}
        />
      </ProfileTemplate>
    )
  },
)

export default VaultsPage
