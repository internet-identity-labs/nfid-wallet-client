export default async () => {
  return await browser.execute(function () {
    // @ts-ignore
    if (typeof this.resetAuthState === "function") {
      // @ts-ignore
      return this.resetAuthState()
    }
  })
}
