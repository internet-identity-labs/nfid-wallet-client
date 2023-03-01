import { IGroupedOptions } from "./types"

export const filterGroupedOptionsByTitle = (
  options: IGroupedOptions[],
  title: string,
  isCaseSensitive = false,
) => {
  const titleToFind = isCaseSensitive ? title : title.toLowerCase()
  return options
    .map((group) => {
      const filteredOptions = group.options.filter((option) => {
        const optionTitle = isCaseSensitive
          ? option.title
          : option.title.toLowerCase()
        return optionTitle.includes(titleToFind)
      })
      return {
        ...group,
        options: filteredOptions,
      }
    })
    .filter((group) => group.options.length > 0)
}
