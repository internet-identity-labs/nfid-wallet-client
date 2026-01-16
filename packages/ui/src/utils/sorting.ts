/**
 * sort alphabetically
 *
 * @param accessor - extract the value to sort by
 */
export const sortAlphabetic =
  <T>(accessor: (item: T) => string) =>
  (a: T, b: T) =>
    accessor(a).localeCompare(accessor(b), "en", { sensitivity: "base" })

/**
 * keep the order of predefined static items
 *
 * @param accessor - extract the value to sort by
 * @param staticOrder - the order of the items that should be kept static
 */
export const keepStaticOrder =
  <T>(accessor: (item: T) => string, staticOrder: string[]) =>
  (items: T[]) => {
    const start = staticOrder
      .map((comparator) =>
        items.find((item) => accessor(item).includes(comparator)),
      )
      .filter((item: T | undefined): item is T => Boolean(item))
    return [
      ...start,
      ...items.filter(
        (item) => !start.find((i) => accessor(i) === accessor(item)),
      ),
    ]
  }
