require('dotenv').config()
let DFX_IC = process.env.IC
let DFX_DEV = process.env.DEV

console.log('env variables are ', DFX_IC, DFX_DEV)

const appendCanisterId = (basePath: string) => {
  return process.env.RUNNER==='LOCAL' ? `${basePath}?canisterId=${DFX_DEV}` :  `${basePath}?canisterId=${DFX_IC}`
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
