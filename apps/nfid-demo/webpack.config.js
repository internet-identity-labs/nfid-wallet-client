import { createRequire } from "module"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import { composePlugins, withNx } from "@nx/webpack"
import { withReact } from "@nx/react"
import TsConfigPathsPlugin from "tsconfig-paths-webpack-plugin"
import webpack from "webpack"
import { getServiceConfig } from "../../config/webpack-env.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const require = createRequire(import.meta.url)

function loadEnvForWebpack() {
  const dotenv = require("dotenv")
  const explicitEnvFile = process.env.ENV_FILE
  const env = process.env.ENV

  if (explicitEnvFile) {
    const envPath = path.resolve(__dirname, "../../", explicitEnvFile)
    if (fs.existsSync(envPath)) {
      console.log(`[webpack] Loading environment from: ${explicitEnvFile}`)
      const result = dotenv.config({ path: envPath })
      if (result.error) {
        console.error(
          `[webpack] Error loading ${explicitEnvFile}:`,
          result.error,
        )
      }
    } else {
      console.warn(
        `[webpack] Warning: Environment file ${explicitEnvFile} not found at ${envPath}`,
      )
    }
    return
  }

  if (!env || env === "local") {
    const envFile = ".env.local"
    const envPath = path.resolve(__dirname, "../../", envFile)
    if (fs.existsSync(envPath)) {
      console.log(`[webpack] Loading environment from: ${envFile}`)
      const result = dotenv.config({ path: envPath })
      if (result.error) {
        console.error(`[webpack] Error loading ${envFile}:`, result.error)
      }
    } else {
      console.warn(
        `[webpack] Warning: Environment file ${envFile} not found at ${envPath}`,
      )
    }
  }
}

loadEnvForWebpack()
const serviceConfig = getServiceConfig()

const removeAutoprefixerPlugin = (plugins) => {
  if (!Array.isArray(plugins)) return plugins
  return plugins.filter((plugin) => {
    const pluginName = plugin?.postcssPlugin || plugin?.name
    return pluginName !== "autoprefixer"
  })
}

const normalizeAndFilterPlugins = (plugins) => {
  if (!plugins) return plugins
  if (Array.isArray(plugins)) return removeAutoprefixerPlugin(plugins)
  if (typeof plugins === "function")
    return (...args) => removeAutoprefixerPlugin(plugins(...args))
  return plugins
}

const removeAutoprefixerFromRule = (rule) => {
  if (rule.oneOf) {
    rule.oneOf = rule.oneOf.map(removeAutoprefixerFromRule)
  }
  if (Array.isArray(rule.use)) {
    rule.use = rule.use.map((loader) => {
      if (
        typeof loader === "object" &&
        typeof loader.loader === "string" &&
        loader.loader.includes("postcss-loader")
      ) {
        const postcssOptions = loader.options?.postcssOptions
        if (typeof postcssOptions === "function") {
          const wrapped = (...args) => {
            const resolved = postcssOptions(...args)
            if (!resolved || typeof resolved !== "object") return resolved
            return {
              ...resolved,
              plugins: normalizeAndFilterPlugins(resolved.plugins),
            }
          }
          Object.assign(wrapped, postcssOptions)
          return {
            ...loader,
            options: { ...loader.options, postcssOptions: wrapped },
          }
        }
        if (postcssOptions && typeof postcssOptions === "object") {
          return {
            ...loader,
            options: {
              ...loader.options,
              postcssOptions: {
                ...postcssOptions,
                plugins: normalizeAndFilterPlugins(postcssOptions.plugins),
              },
            },
          }
        }
      }
      return loader
    })
  }
  return rule
}

export default composePlugins(withNx(), withReact({ svgr: true }), (config) => {
  config.resolve = config.resolve || {}
  config.resolve.alias = {
    ...config.resolve.alias,
    "frontend/hooks": path.resolve(__dirname, "src/stubs/frontend-hooks.ts"),
  }
  config.resolve.plugins = config.resolve.plugins || []
  config.resolve.plugins.push(
    new TsConfigPathsPlugin({
      configFile: path.resolve(__dirname, "tsconfig.json"),
      extensions: [".ts", ".tsx", ".js", ".jsx"],
      mainFields: ["module", "main"],
    }),
  )

  config.resolve.fallback = {
    ...config.resolve.fallback,
    assert: require.resolve("assert"),
    buffer: require.resolve("buffer"),
    events: require.resolve("events"),
    stream: require.resolve("stream-browserify"),
    util: require.resolve("util"),
    https: require.resolve("https-browserify"),
    http: require.resolve("stream-http"),
    crypto: require.resolve("crypto-browserify"),
    path: require.resolve("path-browserify"),
    os: require.resolve("os-browserify/browser"),
    vm: require.resolve("vm-browserify"),
  }

  config.module = config.module || { rules: [] }
  config.module.rules = config.module.rules || []

  const modifyBabelLoader = (rule) => {
    if (
      rule.loader &&
      typeof rule.loader === "string" &&
      rule.loader.includes("babel-loader")
    ) {
      rule.exclude = /node_modules/
      delete rule.include
      return rule
    }
    if (rule.oneOf) rule.oneOf = rule.oneOf.map(modifyBabelLoader)
    if (rule.use && Array.isArray(rule.use)) {
      rule.use = rule.use.map((loader) => {
        if (
          typeof loader === "object" &&
          loader.loader &&
          loader.loader.includes("babel-loader")
        ) {
          return { ...loader, exclude: /node_modules/ }
        }
        return loader
      })
    }
    return rule
  }

  config.module.rules = config.module.rules
    .map(modifyBabelLoader)
    .map(removeAutoprefixerFromRule)

  config.plugins = config.plugins || []
  config.plugins.push(
    new webpack.DefinePlugin(serviceConfig),
    new webpack.ProvidePlugin({
      Buffer: [require.resolve("buffer/"), "Buffer"],
      process: require.resolve("process/browser"),
    }),
  )

  config.ignoreWarnings = [/Failed to parse source map from/]

  return {
    ...config,
    devServer: {
      ...config.devServer,
      open: false,
      port: 4200,
    },
  }
})
