import { bech32 } from "bech32"

import { OCPInvalidLnurlError } from "./errors"

export function decodeLnurl(lnurl: string): string {
  try {
    const decoded = bech32.decode(lnurl, 2048)
    const bytes = bech32.fromWords(decoded.words)
    const url = new TextDecoder().decode(new Uint8Array(bytes))

    if (!url.startsWith("https://")) {
      throw new OCPInvalidLnurlError(lnurl)
    }

    return url
  } catch (e) {
    if (e instanceof OCPInvalidLnurlError) throw e
    throw new OCPInvalidLnurlError(lnurl)
  }
}
