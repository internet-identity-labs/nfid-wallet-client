/**
 * @jest-environment jsdom
 */
import scroll from "./scroll"

let scrollIntoViewMock

describe("scroll", () => {
  beforeEach(() => {
    scrollIntoViewMock = jest.fn()
    global.$ = jest.fn().mockReturnValue({
      scrollIntoView: scrollIntoViewMock,
    })
  })

  it("should call scrollIntoView on the browser object", async () => {
    await scroll("element")
    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1)
  })
})
