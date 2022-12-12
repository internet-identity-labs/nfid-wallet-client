import { snakeToCamel, camelCase } from "./snake-to-camel"

describe("snakeToCamel test suite", () => {
  describe("camelCase string conversion", () => {
    it("converts snake case strings to camel case", () => {
      expect(camelCase("snake_case_string")).toBe("snakeCaseString")
      expect(camelCase("snake_case_string_with_numbers_123")).toBe(
        "snakeCaseStringWithNumbers123",
      )
      expect(camelCase("snake_case_with_empty_string_")).toBe(
        "snakeCaseWithEmptyString",
      )
    })

    it("returns the original string for non-snake-case strings", () => {
      expect(camelCase("camelCaseString")).toBe("camelCaseString")
      expect(camelCase("TitleCaseString")).toBe("TitleCaseString")
      expect(camelCase("lowercaseString")).toBe("lowercaseString")
    })

    it("returns the empty string for empty input", () => {
      expect(camelCase("")).toBe("")
    })
  })
  describe("snakeToCamel recursive object conversion", () => {
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
})
