export const isValidQrCode = (value: string) => {
  try {
    const url = new URL(value)

    const haslnurl = url.searchParams
      .get("lightning")
      ?.toUpperCase()
      .startsWith("LNURL")

    if (
      (url.hostname === "app.dfx.swiss" || url.hostname === "api.dfx.swiss") &&
      haslnurl
    ) {
      return true
    }

    if (
      url.hostname === "api.dfx.swiss" &&
      url.pathname.startsWith("/v1/lnurlp/")
    ) {
      return true
    }

    return false
  } catch {
    return false
  }
}
