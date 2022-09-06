/**
 * Pause execution for a given number of milliseconds
 * @param  {String}   ms   Number of milliseconds to pause
 */
export default async (ms: string) => {
  /**
   * Number of milliseconds
   * @type {Int}
   */

   console.log(await browser.getLogs("browser"));
   console.log("______________________________");
  const intMs = parseInt(ms, 10)

  // eslint-disable-next-line wdio/no-pause
  await browser.pause(intMs)

  console.log(await browser.getLogs("browser"));
}
