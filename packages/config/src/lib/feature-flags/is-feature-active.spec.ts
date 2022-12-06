import { isFeatureActive } from "./is-feature-active"
import { Config, FeatureConfig } from "./types"

describe("isFeatureActive", () => {
  test("should return true for active features", () => {
    const config: Config = {
      newLoginFlow: {
        name: "newLoginFlow",
        config: {
          loginType: "email",
        },
        isActive: (config: FeatureConfig) => config["loginType"] === "email",
      },
      adminDashboard: true,
    }

    expect(isFeatureActive(config, "newLoginFlow")).toBe(true)
    expect(isFeatureActive(config, "adminDashboard")).toBe(true)
  })

  test("should return false for inactive features", () => {
    const config: Config = {
      newLoginFlow: {
        name: "newLoginFlow",
        config: {
          loginType: "phone",
        },
        isActive: (config: FeatureConfig) => config["loginType"] === "email",
      },
      adminDashboard: false,
    }

    expect(isFeatureActive(config, "newLoginFlow")).toBe(false)
    expect(isFeatureActive(config, "adminDashboard")).toBe(false)
  })

  test("should return false for features that do not exist in the config", () => {
    const config: Config = {
      newLoginFlow: {
        name: "newLoginFlow",
        config: {
          loginType: "email",
        },
        isActive: (config: FeatureConfig) => config["loginType"] === "email",
      },
    }

    expect(isFeatureActive(config, "adminDashboard")).toBe(false)
  })
})
