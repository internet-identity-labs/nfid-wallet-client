import { IGroupedOptions } from "@nfid-frontend/ui"

export const concatOptionsWithSameLabel = (options: IGroupedOptions[]) => {
  const mergedTokens = options.reduce<{
    [label: string]: IGroupedOptions
  }>((acc, item) => {
    if (!acc[item.label]) {
      acc[item.label] = item
    } else {
      acc[item.label].options = acc[item.label].options.concat(item.options)
    }
    return acc
  }, {})

  return Object.values(mergedTokens)
}
