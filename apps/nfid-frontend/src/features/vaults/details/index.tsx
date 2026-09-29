import { FC } from "react"
import { useParams } from "react-router-dom"

import { ProfileTemplate } from "@nfid-frontend/ui"
import { useSWR } from "@nfid/swr"
import { VaultDetails } from "packages/ui/src/organisms/vaults/details"

import { NFIDTheme } from "frontend/App"
import { useIdentity } from "frontend/hooks/identity"

import { DelegationIdentity } from "@icp-sdk/core/identity"
import { fetchVaultDetails, fetchVaultInitedTokens } from "../utils"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { portfolioService } from "frontend/integration/portfolio-balance/portfolio-service"
import { nfidVaultsService } from "@nfid/integration"

type VaultDetailsProps = {
  walletTheme: NFIDTheme
  setWalletTheme: (theme: NFIDTheme) => void
}

const VaultDetailsPage: FC<VaultDetailsProps> = ({
  walletTheme,
  setWalletTheme,
}) => {
  const { vaultId } = useParams<{ vaultId: string }>()
  const { identity } = useIdentity()

  const {
    data: vault,
    isLoading,
    isValidating,
    mutate,
  } = useSWR(
    vaultId && identity ? `vault-details-${vaultId}` : null,
    () => fetchVaultDetails(vaultId!, identity! as DelegationIdentity),
    { revalidateOnFocus: false, revalidateIfStale: false },
  )

  console.log("vaulttt", vault)

  const { data: vaultTokens, isLoading: isTokensLoading } = useSWR(
    vaultId && identity ? ["vaultInitedTokens", vaultId] : null,
    () => fetchVaultInitedTokens(vaultId!, identity! as DelegationIdentity),
    { revalidateOnFocus: false },
  )

  const initedTokens = vaultTokens?.initedTokens ?? []

  const { data: usdBalance, isLoading: isUsdLoading } = useSWR(
    initedTokens.length ? ["vaultUsdBalance", vaultId] : null,
    () => portfolioService.getVaultPortfolioUSDBalance(initedTokens),
    { revalidateOnFocus: false },
  )

  return (
    <ProfileTemplate
      pageTitle={vault?.state?.name}
      showBackButton
      backButtonPathname={`${ProfileConstants.vaults}`}
      walletTheme={walletTheme}
      setWalletTheme={setWalletTheme}
      className="w-full z-[1]"
    >
      <VaultDetails
        vault={vault}
        address={vaultId}
        refreshPortfolio={mutate}
        isLoading={isValidating || isLoading || !identity}
        isUsdLoading={isUsdLoading || isTokensLoading}
        usdBalance={usdBalance}
      />
      <div
        className="dark:text-white"
        onClick={() => nfidVaultsService.createWallet(vaultId!, identity!)}
      >
        Create Wallet
      </div>
      <div
        className="dark:text-white"
        onClick={() =>
          nfidVaultsService.approveTransactions(vaultId!, identity!, [
            BigInt(6),
          ])
        }
      >
        Approve
      </div>
    </ProfileTemplate>
  )
}

export default VaultDetailsPage
