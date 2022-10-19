export const sortAlphabetic =
  <T>(accessor: (item: T) => string) =>
  (wallets: T[]) =>
    wallets.sort((a, b) => {
      return accessor(a).localeCompare(accessor(b), "en", {
        sensitivity: "base",
      })
    })

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
