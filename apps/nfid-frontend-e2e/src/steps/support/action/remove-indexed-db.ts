export default async () => {
  return await browser.execute(function () {
    // @ts-ignore
    if (typeof this.resetAuthState === "function") {
      // @ts-ignore
      await this.resetAuthState()
      // @ts-ignore
      this.location.reload()
    }
  })
}
