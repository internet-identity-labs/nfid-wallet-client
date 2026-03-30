type WindowWithResetAuthState = Window & {
  resetAuthState?: () => Promise<unknown>
}

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

  const response = await browser.execute(async function () {
    const authWindow = window as WindowWithResetAuthState

    if (typeof authWindow.resetAuthState === "function") {
      return await authWindow.resetAuthState()
    }

    return "resetAuthState function is not available"
  })
  console.warn("cleared auth state", { response })
}
