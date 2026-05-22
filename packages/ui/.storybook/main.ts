import type { StorybookConfig } from "@storybook/react-webpack5"
import path, { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import TsConfigPathsPlugin from "tsconfig-paths-webpack-plugin"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const workspaceRoot = path.resolve(__dirname, "../../..")

const config: StorybookConfig = {
  core: {},

  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],

  addons: [
    getAbsolutePath("@nx/react/plugins/storybook"),
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-docs"),
  ],

  framework: {
    name: getAbsolutePath("@storybook/react-webpack5"),
    options: {},
  },

  docs: {},

  typescript: {
    reactDocgen: "react-docgen-typescript",
  },

  webpackFinal: async (config) => {
    config.resolve!.fallback = {
      ...config.resolve!.fallback,
      crypto: "crypto-browserify",
      stream: "stream-browserify",
      assert: "assert/",
      http: "stream-http",
      https: "https-browserify",
      os: "os-browserify/browser",
      url: "url/",
      vm: "vm-browserify",
    }

    // Resolve TypeScript path aliases (e.g. @nfid-frontend/ui, frontend/*, packages/ui/src/*)
    config.resolve!.plugins = config.resolve!.plugins || []
    config.resolve!.plugins.push(
      new TsConfigPathsPlugin({
        configFile: path.resolve(workspaceRoot, "tsconfig.base.json"),
        extensions: [".ts", ".tsx", ".js", ".jsx"],
        mainFields: ["module", "main"],
      }),
    )
    // baseUrl-relative imports like `packages/ui/src/atoms/icons` resolve from workspace root
    config.resolve!.modules = [
      ...(config.resolve!.modules || ["node_modules"]),
      workspaceRoot,
    ]

    // Ensure TypeScript/JSX is transpiled before the csf-plugin enforce:post loader runs
    config.module!.rules!.push({
      test: /\.[jt]sx?$/,
      exclude: /node_modules/,
      use: [
        {
          loader: "babel-loader",
          options: {
            configFile: path.resolve(__dirname, "../.babelrc"),
            cacheDirectory: true,
          },
        },
      ],
    })

    config.module!.rules!.push({
      test: /\.css$/,
      use: ["style-loader", "css-loader"],
      include: /packages\/ui\/src/,
    })

    // Mirror the main app's SVG split: ?url → asset/resource, plain → SVGR named export
    config.module!.rules!.forEach((r: any) => {
      if (!r || typeof r !== "object" || !(r.test instanceof RegExp)) return
      if (r.test.test("test.svg")) {
        r.exclude = Array.isArray(r.exclude)
          ? [...r.exclude, /\.svg$/]
          : [r.exclude, /\.svg$/].filter(Boolean)
      }
    })
    config.module!.rules!.push({
      test: /\.svg$/,
      oneOf: [
        {
          resourceQuery: /url/,
          type: "asset/resource",
          generator: { filename: "static/media/[name].[hash][ext]" },
        },
        {
          issuer: /\.[jt]sx?$/,
          use: [
            {
              loader: "@svgr/webpack",
              options: {
                svgo: false,
                titleProp: true,
                ref: true,
                exportType: "named",
                namedExport: "ReactComponent",
              },
            },
          ],
        },
      ],
    } as any)

    return config
  },
}

export default config

// To customize your webpack configuration you can use the webpackFinal field.
// Check https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
// and https://nx.dev/packages/storybook/documents/custom-builder-configs

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)))
}
