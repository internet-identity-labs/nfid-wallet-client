import DFX_JSON from "../../../../.dfx/local/canister_ids.json"

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
