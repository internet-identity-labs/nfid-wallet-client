let DFX_JSON: any

try {
  DFX_JSON = require("../../../../.dfx/local/canister_ids.json")
} catch (e) {
  DFX_JSON = { assets: { local: "deploy-to-local-dfx-first" } }
}

const appendCanisterId = (basePath: string) => {
  return `${basePath}?canisterId=${DFX_JSON.assets.local}`
}
/**
 * Open the given URL
 * @param  {String}   type Type of navigation (getUrl or site)
 * @param  {String}   page The URL to navigate to
 */
export default async (type: "url" | "site", page: string) => {
  /**
   * The URL to navigate to
   * @type {String}
   */
  const url =
    type === "url" ? page : browser.options.baseUrl + appendCanisterId(page)

  await browser.url(url)
}
