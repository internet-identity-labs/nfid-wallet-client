import { sortAddresses } from "./sort-addresses"

const contacts = [
  { id: "1", name: "charlie" },
  { id: "2", name: "Alice" },
  { id: "3", name: "bob" },
  { id: "4", name: "Dave" },
]

const names = (list: typeof contacts) => list.map((c) => c.name)

describe("sortAddresses", () => {
  it("puts favorites first in added order, then the rest alphabetically", () => {
    expect(names(sortAddresses(contacts, "default", ["4", "1"]))).toEqual([
      "Dave",
      "charlie",
      "Alice",
      "bob",
    ])
  })

  it("is alphabetical without favorites, ignoring case", () => {
    expect(names(sortAddresses(contacts, "default"))).toEqual([
      "Alice",
      "bob",
      "charlie",
      "Dave",
    ])
  })

  it("ignores favorites when sorting by name", () => {
    expect(names(sortAddresses(contacts, "ascending", ["4"]))).toEqual([
      "Alice",
      "bob",
      "charlie",
      "Dave",
    ])
    expect(names(sortAddresses(contacts, "descending", ["2"]))).toEqual([
      "Dave",
      "charlie",
      "bob",
      "Alice",
    ])
  })

  it("ignores favorite ids that are not in the list and keeps the input", () => {
    const input = [...contacts]
    sortAddresses(input, "default", ["missing", "3"])
    expect(input).toEqual(contacts)
    expect(sortAddresses(input, "default", ["missing", "3"])[0].name).toBe(
      "bob",
    )
  })
})
