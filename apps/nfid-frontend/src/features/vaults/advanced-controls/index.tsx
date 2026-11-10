import { FC, useCallback } from "react"
import { useParams } from "react-router-dom"

import { ProfileTemplate } from "@nfid-frontend/ui"
import { VaultAdvancedControls } from "packages/ui/src/organisms/vaults/advanced-controls"

import { NFIDTheme } from "frontend/App"
import { useIdentity } from "frontend/hooks/identity"
import {
  fetchVaultDetails,
  fetchVaultInitedTokens,
  formatCycles,
} from "../utils"
import { useSWR } from "@nfid/swr"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { nfidVaultsService } from "@nfid/integration"
import { getValidatorByTokenAddress } from "frontend/features/transfer-modal/utils"
import {
  ICP_CANISTER_ID,
  ICP_DECIMALS,
  WALLET_FEE,
} from "@nfid/integration/token/constants"
import { DelegationIdentity } from "@dfinity/identity"

export type VaultPortfolioProps = {
  walletTheme: NFIDTheme
  setWalletTheme: (theme: NFIDTheme) => void
}

const VaultAdvancedControlsPage: FC<VaultPortfolioProps> = ({
  walletTheme,
  setWalletTheme,
}) => {
  const { vaultId } = useParams<{ vaultId: string }>()
  const { identity } = useIdentity()

  const {
    data: controllers,
    isLoading,
    mutate,
  } = useSWR(vaultId && identity ? ["vault-controllers", vaultId] : null, () =>
    nfidVaultsService.getControllers(vaultId!, identity!),
  )

  const { data: vault, mutate: mutateVault } = useSWR(
    vaultId && identity ? `vault-details-${vaultId}` : null,
    () => fetchVaultDetails(vaultId!, identity! as DelegationIdentity),
    { revalidateOnFocus: false, revalidateIfStale: false },
  )

  const currentQuorum = vault?.state.quorum.quorum

  const { data: cyclesBalance, mutate: updateCycleBalance } = useSWR(
    vaultId && identity ? ["vault-cycles", vaultId] : null,
    () => nfidVaultsService.getCyclesBalance(vaultId!, identity!),
  )

  const { data: xdrPermyriadPerIcp } = useSWR(
    identity ? "xdr-permyriad-per-icp" : null,
    () => nfidVaultsService.getXdrPermyriadPerIcp(identity!),
  )

  const { data: vaultTokens } = useSWR(
    vaultId && identity ? ["vaultInitedTokens", vaultId] : null,
    () => fetchVaultInitedTokens(vaultId!, identity! as DelegationIdentity),
    { revalidateOnFocus: false },
  )

  const icpTokenBalance = vaultTokens?.initedTokens
    .find((t) => t.getTokenAddress() === ICP_CANISTER_ID)
    ?.getTokenBalance()

  const vaultIcpBalance =
    icpTokenBalance !== undefined
      ? Number(icpTokenBalance) / 10 ** ICP_DECIMALS - WALLET_FEE
      : undefined

  const updateControllers = useCallback(
    async (controllers: string[]) => {
      if (!vaultId || !identity) return
      await nfidVaultsService.updateControllers(
        vaultId,
        identity,
        controllers,
        currentQuorum,
      )
      mutate()
    },
    [vaultId, identity, currentQuorum, mutate],
  )

  const purge = useCallback(async () => {
    if (!vaultId || !identity) return
    await nfidVaultsService.purgeTransactions(vaultId, identity, currentQuorum)
    await mutateVault()
  }, [vaultId, identity, currentQuorum, mutateVault])

  const topUp = useCallback(
    async (amount: string) => {
      if (!vaultId || !identity) return
      const amountRaw = BigInt(Number(amount) * 10 ** ICP_DECIMALS)
      await nfidVaultsService.topUp(vaultId, identity, amountRaw, currentQuorum)
      updateCycleBalance()
    },
    [vaultId, identity, currentQuorum, updateCycleBalance],
  )

  return (
    <ProfileTemplate
      pageTitle="Advanced controls"
      showBackButton
      backButtonPathname={`${ProfileConstants.vaults}/${vaultId}`}
      walletTheme={walletTheme}
      setWalletTheme={setWalletTheme}
      className="w-full z-[1] mb-[22px]"
    >
      <VaultAdvancedControls
        updateControllers={updateControllers}
        validateAddress={getValidatorByTokenAddress}
        controllers={controllers}
        isLoading={isLoading || !identity}
        purge={purge}
        vaultId={vaultId}
        cyclesBalance={formatCycles(cyclesBalance)}
        xdrPermyriadPerIcp={xdrPermyriadPerIcp}
        topUp={topUp}
        vaultIcpBalance={vaultIcpBalance}
      />
    </ProfileTemplate>
  )
}

export default VaultAdvancedControlsPage
