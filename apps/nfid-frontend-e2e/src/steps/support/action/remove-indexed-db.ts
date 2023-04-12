export default async () => {
  return await browser.execute(function (key) {
    // @ts-ignore
    this.indexedDB.deleteDatabase(key)
  }, "authstate")
}
