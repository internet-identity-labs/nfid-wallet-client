import { filterGroupedOptionsByTitle } from "./helpers"
import { IGroupedOptions } from "./types"

describe("filterGroupedOptionsByTitle", () => {
  const options: IGroupedOptions[] = [
    {
      label: "Group 1",
      options: [
        { title: "Option 1", value: "1" },
        { title: "Option 2", value: "2" },
        { title: "Option 3", value: "3" },
      ],
    },
    {
      label: "Group 2",
      options: [
        { title: "Option 4", value: "4" },
        { title: "Option 5", value: "5" },
        { title: "Option 6", value: "6" },
      ],
    },
  ]

  it("filters options by title (case-insensitive)", () => {
    const filteredOptions = filterGroupedOptionsByTitle(options, "option 2")
    expect(filteredOptions).toEqual([
      {
        label: "Group 1",
        options: [{ title: "Option 2", value: "2" }],
      },
    ])
  })

  it("filters options by title (case-sensitive)", () => {
    const filteredOptions = filterGroupedOptionsByTitle(
      options,
      "Option 2",
      true,
    )
    expect(filteredOptions).toEqual([
      {
        label: "Group 1",
        options: [{ title: "Option 2", value: "2" }],
      },
    ])
  })

  it("returns an empty array if no options match the search string", () => {
    const filteredOptions = filterGroupedOptionsByTitle(
      options,
      "non-existent title",
    )
    expect(filteredOptions).toEqual([])
  })
})
