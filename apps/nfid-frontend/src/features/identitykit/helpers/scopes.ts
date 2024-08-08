export const mapPermissionsResponse = (
  permissions: string[],
): { scope: { method: string }; state: "granted" }[] => {
  return permissions.map((x) => {
    return { scope: { method: x }, state: "granted" }
  })
}
