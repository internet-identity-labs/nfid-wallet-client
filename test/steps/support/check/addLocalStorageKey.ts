export default async (key: string, value: string) => {
  // https://github.com/webdriverio/webdriverio/issues/4340
  await browser.execute(
    function (key, value) {
      // @ts-ignore
      return this.localStorage.setItem(key, value)
    },
    key,
    value,
  )

  console.debug("checkLocalStorageKey", { key, value })
}
