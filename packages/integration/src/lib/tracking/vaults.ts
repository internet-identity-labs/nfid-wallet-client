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
}

export const vaultsTracking = new VaultsTracking()
