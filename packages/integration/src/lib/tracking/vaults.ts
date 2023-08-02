import posthog from "posthog-js"

class VaultsTracking {
  public vaultsLoaded(totalVaults: number) {
    const title = "Vaults loaded"
    const data = { totalVaults }
    console.debug("VaultsTracking.vaultsLoaded", {
      title,
      data: { numberVaults: totalVaults },
    })

    posthog.capture(title, data)
  }

  public vaultsModalOpened() {
    const title = "Add vault modal loaded"
    console.debug("VaultsTracking.vaultsModalOpened", { title })
    posthog.capture(title)
  }

  public vaultCreaded() {
    const title = "Vault created"
    console.debug("VaultsTracking.vaultCreaded", { title })
    posthog.capture(title)
  }

  public walletsLoaded({
    vaultId,
    totalAccounts,
    totalICPBalance,
  }: {
    vaultId: string
    totalAccounts: number
    totalICPBalance: number
  }) {
    const title = "Vault accounts loaded"
    const data = { vaultId, totalAccounts, totalICPBalance }
    console.debug("VaultsTracking.walletsLoaded", { title, data })
    posthog.capture(title, data)
  }

  public addVaultAccountModalOpened() {
    const title = "Add vault account modal loaded"
    console.debug("VaultsTracking.addVaultAccountModalOpened", { title })
    posthog.capture(title)
  }

  public vaultAccountCreated(vaultId: string) {
    const title = "Vault account created"
    console.debug("VaultsTracking.vaultAccountCreated", { title, vaultId })
    posthog.capture(title, { vaultId })
  }

  public vaultMembersLoaded({
    vaultId,
    totalMembers,
    totalActiveMembers,
    totalInactiveMembers,
  }: {
    vaultId: string
    totalMembers: number
    totalActiveMembers: number
    totalInactiveMembers: number
  }) {
    const title = "Vault members loaded"
    console.debug("VaultsTracking.vaultMembersLoaded", {
      title,
      vaultId,
      totalMembers,
      totalActiveMembers,
      totalInactiveMembers,
    })
    posthog.capture(title, {
      vaultId,
      totalMembers,
      totalActiveMembers,
      totalInactiveMembers,
    })
  }

  public addVaultMemberModalOpened(vaultId: string) {
    const title = "Add vault member modal loaded"
    console.debug("VaultsTracking.addVaultMemberModalOpened", {
      title,
      vaultId,
    })
    posthog.capture(title, { vaultId })
  }

  public addVaultMemberCreated(vaultId: string) {
    const title = "Vault member created"
    console.debug("VaultsTracking.addVaultMemberCreated", { title, vaultId })
    posthog.capture(title, { vaultId })
  }

  public vaultMemberUpdated(vaultId: string) {
    const title = "Vault member edited"
    console.debug("VaultsTracking.vaultMemberUpdated", { title, vaultId })
    posthog.capture(title, { vaultId })
  }

  public vaultMemberArchived(vaultId: string) {
    const title = "Vault member archived"
    console.debug("VaultsTracking.vaultMemberArchived", { title, vaultId })
    posthog.capture(title, { vaultId })
  }

  public vaultPoliciesLoaded(vaultId: string, totalPolicies: number) {
    const title = "Vault policies loaded"
    console.debug("VaultsTracking.vaultPoliciesLoaded", {
      title,
      vaultId,
      totalPolicies,
    })
    posthog.capture(title, { vaultId, totalPolicies })
  }

  public addVaultPolicyModalOpened(vaultId: string) {
    const title = "Add vault policy modal loaded"
    console.debug("VaultsTracking.addVaultPolicyModalOpened", {
      title,
      vaultId,
    })
    posthog.capture(title, { vaultId })
  }

  public vaultPolicyCreated(vaultId: string) {
    const title = "Vault policy created"
    console.debug("VaultsTracking.vaultPolicyCreated", { title, vaultId })
    posthog.capture(title, { vaultId })
  }

  public vaultPolicyUpdated(vaultId: string) {
    const title = "Vault policy edited"
    console.debug("VaultsTracking.vaultPolicyCreated", { title, vaultId })
    posthog.capture(title, {
      vaultId,
    })
  }

  public vaultPolicyArchived(vaultId: string) {
    const title = "Vault policy archived"
    console.debug("VaultsTracking.vaultPolicyCreated", { title, vaultId })
    posthog.capture(title, { vaultId })
  }

  public vaultTransactionsLoaded({
    vaultId,
    totalTransactions,
    viewIsFiltered,
  }: {
    vaultId: string
    totalTransactions: number
    viewIsFiltered: boolean
  }) {
    const title = "Vault transactions loaded"
    console.debug("VaultsTracking.vaultTransactionsLoaded", {
      title,
      vaultId,
      totalTransactions,
      viewIsFiltered,
    })
    posthog.capture(title, { vaultId, totalTransactions, viewIsFiltered })
  }

  public vaultTransactionLoaded({
    vaultId,
    transactionId,
    status,
    amount,
  }: {
    vaultId: string
    transactionId: string
    status: string
    amount: number
  }) {
    const title = "Vault transaction loaded"
    console.debug("VaultsTracking.vaultTransactionLoaded", {
      title,
      vaultId,
      transactionId,
      status,
      amount,
    })
    posthog.capture(title, { vaultId, transactionId, status, amount })
  }
}

export const vaultsTracking = new VaultsTracking()
