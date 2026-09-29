import { nfidVaultsService } from "@nfid/integration"
import { DelegationIdentity } from "@icp-sdk/core/identity"

export const fetchVaults = async () => nfidVaultsService.getVaults()

export const fetchVaultDetails = async (
  canisterId: string,
  identity: DelegationIdentity,
) => {
  const manager = nfidVaultsService.getManager(canisterId, identity)
  const [state, transactions] = await Promise.all([
    manager.getState(),
    manager.getTransactions(),
  ])
  return { state, transactions }
}
