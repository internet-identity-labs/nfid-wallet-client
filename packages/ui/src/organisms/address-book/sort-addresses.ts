export type AddressSortOrder = "default" | "ascending" | "descending"

interface Named {
  id: string
  name?: string
}

const byName = (a: Named, b: Named) =>
  (a.name ?? "").toLowerCase().localeCompare((b.name ?? "").toLowerCase())

/**
 * Address book order. Default (sc-19794): favorites in the order they were
 * added, then the rest alphabetically. By name ascending/descending ignores
 * favorites. Returns a new array.
 */
export const sortAddresses = <T extends Named>(
  addresses: T[],
  order: AddressSortOrder,
  favoriteIds: string[] = [],
): T[] => {
  if (order === "ascending") return [...addresses].sort(byName)
  if (order === "descending") return [...addresses].sort((a, b) => byName(b, a))

  const rank = new Map(favoriteIds.map((id, i) => [id, i]))
  const favorites = addresses
    .filter((a) => rank.has(a.id))
    .sort((a, b) => rank.get(a.id)! - rank.get(b.id)!)
  const rest = addresses.filter((a) => !rank.has(a.id)).sort(byName)
  return [...favorites, ...rest]
}
