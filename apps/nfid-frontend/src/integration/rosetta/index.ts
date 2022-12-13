declare const CURRCONV_TOKEN: string

export const WALLET_SCOPE = "nfid.one"
export const converter = `https://free.currconv.com/api/v7/convert?q=XDR_USD&compact=ultra&apiKey=${
  CURRCONV_TOKEN ?? "***REMOVED***"
}`

// TODO WALLET. Code review delegation. Test should be written
export const WALLET_SESSION_TTL = BigInt(2 * 60 * 1e9)
