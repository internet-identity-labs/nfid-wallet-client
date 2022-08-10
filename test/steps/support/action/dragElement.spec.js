/**
 * @jest-environment jsdom
 */
import dragElement from "./dragElement"

let dragElementMock

describe("dragElement", () => {
  beforeEach(() => {
    dragElementMock = jest.fn()
    global.$ = jest.fn().mockReturnValue({
      dragAndDrop: dragElementMock,
    })
  })

  it("should call dragAndDrop on the browser", async () => {
    await dragElement("source", "destination")

    expect(dragElementMock).toHaveBeenCalledTimes(1)
  })
})
