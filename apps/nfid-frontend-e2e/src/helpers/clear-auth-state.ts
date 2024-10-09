export default async () => {
  const root = $("#root")

  await root.waitUntil(
    async function () {
      return (await root.getAttribute("data-cache-loaded")) === "true"
    },
    {
      timeout: 15000,
      timeoutMsg: "expected data-cache-loaded to be true after 15s",
    },
  )

  const response = await browser.executeAsync(function (done) {
    // @ts-ignore
    if (typeof this.resetAuthState === "function") {
      // @ts-ignore
      return this.resetAuthState().then(done)
    }
  })
  console.log("cleared auth state", { response })
}
