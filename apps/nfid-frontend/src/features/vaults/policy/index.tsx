import { FC, useCallback } from "react"
import { useParams } from "react-router-dom"

import { ProfileTemplate } from "@nfid-frontend/ui"
import { VaultPolicy } from "packages/ui/src/organisms/vaults/policy"

import { NFIDTheme } from "frontend/App"
import { getValidatorByTokenAddress } from "frontend/features/transfer-modal/utils"
import { nfidVaultsService } from "@nfid/integration"
import { useIdentity } from "frontend/hooks/identity"
import { DelegationIdentity } from "@icp-sdk/core/identity"
import { VaultRole } from "@nfid/vaults"
import { Principal } from "@icp-sdk/core/principal"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { useSWR } from "@nfid/swr"
import { fetchVaultDetails } from "../utils"

export type VaultPolicyProps = {
  walletTheme: NFIDTheme
  setWalletTheme: (theme: NFIDTheme) => void
}

const VaultPolicyPage: FC<VaultPolicyProps> = ({
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

  const addMember = useCallback(
    async (
      owner: Principal,
      name: string,
      subaccount?: Uint8Array | number[],
    ) => {
      if (!vaultId) return

      await nfidVaultsService.addMember(
        vaultId,
        identity as DelegationIdentity,
        {
          owner,
          subaccount,
          name,
          role: VaultRole.ADMIN,
        },
      )
      setTimeout(mutate, 2000)
      //mutate()
    },
    [vaultId, identity],
  )

  const updateQuorum = useCallback(
    async (quorum: number) => {
      if (!vaultId) return

      await nfidVaultsService.updateQuorum(
        vaultId,
        identity as DelegationIdentity,
        quorum,
      )
      setTimeout(mutate, 5000)
    },
    [vaultId, identity],
  )

  const updateMember = useCallback(
    async (memberId: string, name: string) => {
      if (!vaultId) return

      await nfidVaultsService.updateMemberName(
        vaultId,
        identity as DelegationIdentity,
        memberId,
        name,
      )
      mutate()
    },
    [vaultId, identity],
  )

  const removeMember = useCallback(
    async (memberId: string) => {
      if (!vaultId) return

      await nfidVaultsService.removeMember(
        vaultId,
        identity as DelegationIdentity,
        memberId,
      )
      mutate()
    },
    [vaultId, identity],
  )

  return (
    <ProfileTemplate
      pageTitle="Security policy"
      showBackButton
      backButtonPathname={`${ProfileConstants.vaults}/${vaultId}`}
      walletTheme={walletTheme}
      setWalletTheme={setWalletTheme}
      className="w-full z-[1] mb-[22px]"
    >
      <VaultPolicy
        validateAddress={getValidatorByTokenAddress}
        updateQuorum={updateQuorum}
        addMember={addMember}
        updateMember={updateMember}
        removeMember={removeMember}
        isLoading={isLoading || isValidating || !identity}
        vault={vault}
      />
    </ProfileTemplate>
  )
}

export default VaultPolicyPage
