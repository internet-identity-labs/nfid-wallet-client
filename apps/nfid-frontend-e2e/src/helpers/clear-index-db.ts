export async function clearIndexDb(
  browser: WebdriverIO.Browser,
): Promise<void> {
  await browser.execute(function () {
    // @ts-ignore
    this.indexedDB.databases().then((dbs) => {
      // @ts-ignore
      dbs.map((db) => this.indexedDB.deleteDatabase(db.name))
    })
  })
}
