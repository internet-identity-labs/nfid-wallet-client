import { snakeToCamel } from "./snake-to-camel"

describe("snakeToCamel", () => {
  it("converts property names from snake case to camel case", () => {
    const obj = {
      snake_case_property: "value",
      nested_object: {
        another_snake_case_property: "another value",
      },
      array_property: [
        { snake_case_in_array: "array value" },
        { another_snake_case_in_array: "another array value" },
      ],
    }

    const expected = {
      snakeCaseProperty: "value",
      nestedObject: {
        anotherSnakeCaseProperty: "another value",
      },
      arrayProperty: [
        { snakeCaseInArray: "array value" },
        { anotherSnakeCaseInArray: "another array value" },
      ],
    }

    expect(snakeToCamel(obj)).toEqual(expected)
  })

  it("returns the original value for non-object inputs", () => {
    expect(snakeToCamel("string")).toBe("string")
    expect(snakeToCamel(1234)).toBe(1234)
    expect(snakeToCamel(true)).toBe(true)
    expect(snakeToCamel(null)).toBe(null)
    expect(snakeToCamel(undefined)).toBe(undefined)
  })

  it("converts property names in arrays", () => {
    const obj = [
      { snake_case_in_array: "array value" },
      { another_snake_case_in_array: "another array value" },
    ]

    const expected = [
      { snakeCaseInArray: "array value" },
      { anotherSnakeCaseInArray: "another array value" },
    ]

    expect(snakeToCamel(obj)).toEqual(expected)
  })
})
