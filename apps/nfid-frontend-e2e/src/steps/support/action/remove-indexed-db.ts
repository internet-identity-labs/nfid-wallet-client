export default async () => {
  return await browser.execute(function (key) {
    try {
      // @ts-ignore
      return this.indexedDB.deleteDatabase(key)
    } catch (e) {
      // database not found
      return
    }
  }, "authstate")
}
