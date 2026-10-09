import { FC, useCallback } from "react"
import { useParams } from "react-router-dom"

import { ProfileTemplate } from "@nfid-frontend/ui"
import { VaultAdvancedControls } from "packages/ui/src/organisms/vaults/advanced-controls"

import { NFIDTheme } from "frontend/App"
import { useIdentity } from "frontend/hooks/identity"
import { fetchVaultInitedTokens, formatCycles, refetchVaults } from "../utils"
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
      await nfidVaultsService.updateControllers(vaultId, identity, controllers)
      refetchVaults(mutate)
    },
    [vaultId, identity, mutate],
  )

  const purge = useCallback(async () => {
    if (!vaultId || !identity) return
    await nfidVaultsService.purgeTransactions(vaultId, identity)
  }, [vaultId, identity])

  const topUp = useCallback(
    async (amount: string) => {
      if (!vaultId || !identity) return
      const amountRaw = BigInt(Number(amount) * 10 ** ICP_DECIMALS)
      await nfidVaultsService.topUp(vaultId, identity, amountRaw)
      refetchVaults(updateCycleBalance)
    },
    [vaultId, identity],
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
