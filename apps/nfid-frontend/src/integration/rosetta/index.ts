declare const CURRCONV_TOKEN: string

export const WALLET_SCOPE = "nfid.one"
export const converter = `https://free.currconv.com/api/v7/convert?q=XDR_USD&compact=ultra&apiKey=${
  CURRCONV_TOKEN ?? "df6440fc0578491bb13eb2088c4f60c7"
}`

// TODO WALLET. Code review delegation. Test should be written
export const WALLET_SESSION_TTL = BigInt(2 * 60 * 1e9)
