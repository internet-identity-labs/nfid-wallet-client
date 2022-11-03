export default async (key: string, falseCase: string) => {
  // https://github.com/webdriverio/webdriverio/issues/4340
  const value = await browser.execute(function (key) {
    // @ts-ignore
    return this.localStorage.getItem(key)
  }, key)

  console.debug("checkLocalStorageKey", { key, falseCase, value })
  if (Boolean(falseCase)) {
    return expect(value).toBeFalsy()
  }
  expect(value).toBeTruthy()
}
