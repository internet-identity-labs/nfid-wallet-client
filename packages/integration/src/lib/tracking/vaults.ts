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
}

export const vaultsTracking = new VaultsTracking()
