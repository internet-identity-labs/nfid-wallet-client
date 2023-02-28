/* eslint-disable @typescript-eslint/no-empty-function */
import { processArray } from "./array"

describe("processArray", () => {
  test("calls the processElement function for each element in the array", () => {
    const array = [1, 2, 3, 4, 5]
    const mockProcessElement = jest.fn((element: number, done: () => void) =>
      done(),
    )
    const mockCallback = jest.fn(() => {})
    processArray(array, mockProcessElement, mockCallback)
    expect(mockProcessElement).toHaveBeenCalledTimes(array.length)
    expect(mockProcessElement).toHaveBeenNthCalledWith(
      1,
      1,
      expect.any(Function),
    )
    expect(mockProcessElement).toHaveBeenNthCalledWith(
      2,
      2,
      expect.any(Function),
    )
    expect(mockProcessElement).toHaveBeenNthCalledWith(
      3,
      3,
      expect.any(Function),
    )
    expect(mockProcessElement).toHaveBeenNthCalledWith(
      4,
      4,
      expect.any(Function),
    )
    expect(mockProcessElement).toHaveBeenNthCalledWith(
      5,
      5,
      expect.any(Function),
    )
  })

  test("waits for the processElement function to finish before calling the next one", async () => {
    const array = [1, 2, 3, 4, 5]
    const mockProcessElement = jest.fn((element: number, done: () => void) =>
      setTimeout(done, 1000),
    )
    const mockCallback = jest.fn(() => {})
    const startTime = Date.now()
    await processArray(array, mockProcessElement, mockCallback)
    const endTime = Date.now()
    const duration = endTime - startTime
    expect(duration).toBeGreaterThanOrEqual(5000)
  })

  test("calls the callback function when all elements have been processed", () => {
    const array = [1, 2, 3, 4, 5]
    const mockProcessElement = jest.fn((element: number, done: () => void) =>
      done(),
    )
    const mockCallback = jest.fn(() => {})
    processArray(array, mockProcessElement, mockCallback)
    expect(mockCallback).toHaveBeenCalledTimes(1)
  })

  test("handles empty arrays", () => {
    const array: number[] = []
    const mockProcessElement = jest.fn((element: number, done: () => void) =>
      done(),
    )
    const mockCallback = jest.fn(() => {})
    processArray(array, mockProcessElement, mockCallback)
    expect(mockProcessElement).toHaveBeenCalledTimes(0)
    expect(mockCallback).toHaveBeenCalledTimes(1)
  })
})
