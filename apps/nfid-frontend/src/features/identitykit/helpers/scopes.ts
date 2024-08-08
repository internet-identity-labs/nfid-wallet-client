export const mapPermissionsResponse = (
  permissions: string[],
): { scopes: { scope: { method: string }; state: string }[] } => {
  const scopes = permissions.map((x) => {
    return { scope: { method: x }, state: "granted" }
  })

  return { scopes }
}
