type FeatureName = string

type Feature = string

type PropertyName = string

type FeatureConfig = { [property: PropertyName]: any }

type FeaturePolicy = {
  name: FeatureName
  config: { [key: string]: string }
  isActive: (config: FeatureConfig) => boolean
}

type Config = {
  [feature: Feature]: boolean | FeaturePolicy
}
