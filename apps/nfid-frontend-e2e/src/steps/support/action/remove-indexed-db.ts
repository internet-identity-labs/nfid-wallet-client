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

  return await browser.execute(function () {
    // @ts-ignore
    if (typeof this.resetAuthState === "function") {
      // @ts-ignore
      return this.resetAuthState()
    }
  })
}
