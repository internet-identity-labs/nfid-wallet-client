export const SUPPORTED_STANDARDS = [
  "icrc27_accounts",
  "icrc34_delegation",
  "icrc49_call_canister",
]

export const preparePermissionsResponse = (): {
  scopes: { scope: { method: string }; state: string }[]
} => {
  const scopes = SUPPORTED_STANDARDS.map((x) => {
    return { scope: { method: x }, state: "granted" }
  })

  return { scopes }
}
