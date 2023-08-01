import posthog from "posthog-js"

class VaultsTracking {
  vaultsLoaded(totalVaults: number) {
    const title = "Vaults loaded"
    const data = { totalVaults }
    console.debug("VaultsTracking.vaultsLoaded", {
      title,
      data: { numberVaults: totalVaults },
    })

    posthog.capture(title, data)
  }
}

export const vaultsTracking = new VaultsTracking()
