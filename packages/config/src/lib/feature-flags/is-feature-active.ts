import { Config, FeatureName } from "./types"

export function isFeatureActive(config: Config, feature: FeatureName): boolean {
  const featurePolicy = config[feature]

  if (!featurePolicy) return false

  if (typeof featurePolicy === "boolean") return featurePolicy

  return featurePolicy.isActive(featurePolicy.config)
}
