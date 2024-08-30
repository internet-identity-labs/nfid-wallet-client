export const SUPPORTED_STANDARDS = [
  "icrc27_accounts",
  "icrc34_delegation",
  "icrc49_call_canister",
]

export const mapPermissionsResponse = (
  permissions: string[],
): { scopes: { scope: { method: string }; state: string }[] } => {
  const filteredPermissions = permissions.filter((x) =>
    SUPPORTED_STANDARDS.includes(x),
  )

  const grantedScopes = filteredPermissions.map((x) => {
    return { scope: { method: x }, state: "granted" }
  })

  const scopes = SUPPORTED_STANDARDS.map((s) => {
    if (grantedScopes.findIndex((g) => g.scope.method === s) === -1) {
      return { scope: { method: s }, state: "ask_on_use" }
    }
    const scope = grantedScopes.find((g) => g.scope.method === s)
    if (!scope) throw new Error("Not reachable")
    return scope
  })

  return { scopes }
}
