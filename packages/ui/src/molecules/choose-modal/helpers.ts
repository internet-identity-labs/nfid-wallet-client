import { IGroupedOptions, IGroupOption } from "./types"

export const filterGroupedOptionsByTitle = (
  options: IGroupedOptions[],
  title: string,
  isCaseSensitive = false,
) => {
  const titleToFind = isCaseSensitive ? title : title.toLowerCase()
  return options
    .map((group) => {
      const filteredOptions = group?.options?.filter((option) => {
        const optionTitle = isCaseSensitive
          ? option?.title
          : option?.title?.toLowerCase()
        return optionTitle?.includes(titleToFind)
      })
      return {
        ...group,
        options: filteredOptions,
      }
    })
    .filter((group) => group?.options?.length > 0)
}

export const findOptionByValue = (
  groups: IGroupedOptions[],
  value: string,
): IGroupOption | undefined => {
  const matchingOptions = groups.flatMap((group) =>
    group.options.filter((option) => option.value === value),
  )
  return matchingOptions.length > 0 ? matchingOptions[0] : undefined
}
