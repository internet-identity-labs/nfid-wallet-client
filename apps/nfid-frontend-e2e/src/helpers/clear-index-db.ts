export function clearIndexDb(browser: WebdriverIO.Browser): void {
  browser.execute(function () {
    // @ts-ignore
    this.indexedDB.databases().then((dbs) => {
      // @ts-ignore
      dbs.map((db) => this.indexedDB.deleteDatabase(db.name))
    })
  })
}
