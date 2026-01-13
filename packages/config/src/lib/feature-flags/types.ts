export type FeatureName = string

export type Feature = string

export type PropertyName = string

export type FeatureConfig = { [property: PropertyName]: unknown }

export type FeaturePolicy = {
  name: FeatureName
  config: { [key: string]: string }
  isActive: (config: FeatureConfig) => boolean
}

export type Config = {
  [feature: Feature]: undefined | boolean | FeaturePolicy
}
