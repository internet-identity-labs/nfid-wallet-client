/**
 * Focus the previously or last opened window
 * @param  {String}   position Position of object to focus to (previous or last)
 * @param  {String}   obsolete Type of object to focus to (window or tab)
 */
/* eslint-disable no-unused-vars */
export default async (position: any, obsolete: any) => {
  /* eslint-enable no-unused-vars */
  /**
   * The last or previously opened window
   * @type {Object}
   */

  const positionNumber: number = position === "last" ? -1 : -2
  const lastWindowHandle = (await browser.getWindowHandles()).slice(
    positionNumber,
  )[0]

  await browser.switchToWindow(lastWindowHandle)
}
