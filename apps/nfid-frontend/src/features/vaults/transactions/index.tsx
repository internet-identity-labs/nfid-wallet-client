import { FC } from "react"
import { useParams } from "react-router-dom"

import { ProfileTemplate } from "@nfid-frontend/ui"
import { useSWR } from "@nfid/swr"
import { VaultTransactions } from "packages/ui/src/organisms/vaults/transactions"

import { NFIDTheme } from "frontend/App"
import { useIdentity } from "frontend/hooks/identity"

import { DelegationIdentity } from "@icp-sdk/core/identity"
import { nfidVaultsService } from "@nfid/integration"
import { fetchVaultDetails, fetchVaultInitedTokens } from "../utils"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"

type VaultTransactionsProps = {
  walletTheme: NFIDTheme
  setWalletTheme: (theme: NFIDTheme) => void
}

const VaultTransactionsPage: FC<VaultTransactionsProps> = ({
  walletTheme,
  setWalletTheme,
}) => {
  const { vaultId } = useParams<{ vaultId: string }>()
  const { identity } = useIdentity()

  const {
    data: vault,
    isLoading,
    isValidating,
  } = useSWR(
    vaultId && identity ? `vault-details-${vaultId}` : null,
    () => fetchVaultDetails(vaultId!, identity! as DelegationIdentity),
    { revalidateOnFocus: false, revalidateIfStale: false },
  )

  const { data: vaultTokens } = useSWR(
    vaultId && identity ? ["vaultInitedTokens", vaultId] : null,
    () => fetchVaultInitedTokens(vaultId!, identity! as DelegationIdentity),
    { revalidateOnFocus: false },
  )

  const { data: xdrPermyriadPerIcp } = useSWR(
    identity ? "xdr-permyriad-per-icp" : null,
    () => nfidVaultsService.getXdrPermyriadPerIcp(identity!),
  )

  return (
    <ProfileTemplate
      pageTitle="Transaction history"
      showBackButton
      backButtonPathname={`${ProfileConstants.vaults}/${vaultId}`}
      walletTheme={walletTheme}
      setWalletTheme={setWalletTheme}
      className="w-full z-[1]"
    >
      <VaultTransactions
        vault={vault}
        vaultId={vaultId}
        tokens={vaultTokens?.allTokens ?? []}
        isLoading={isValidating || isLoading || !identity}
        xdrPermyriadPerIcp={xdrPermyriadPerIcp}
      />
    </ProfileTemplate>
  )
}

export default VaultTransactionsPage
