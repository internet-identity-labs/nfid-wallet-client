import { render } from "@testing-library/react"

import { Image, getImageUrl } from "."
import * as isProductionMock from "../../utils/is-production"

describe("Imgix integration", () => {
  beforeEach(() => {
    jest.spyOn(isProductionMock, "isProduction").mockImplementation(() => true)
  })
  describe("Image component", () => {
    it("renders an img tag with the correct src when given a webp image", () => {
      const props = { src: "image.webp", alt: "image" }
      const { getByAltText } = render(<Image {...props} />)
      expect(getByAltText("image").getAttribute("src")).toEqual(
        "https://nfid.imgix.net/image.webp",
      )
    })

    it("renders an img tag with the correct src when given a data URL", () => {
      const props = { src: "data:image/png;base64,iVBORw0KG...", alt: "image" }
      const { getByAltText } = render(<Image {...props} />)
      expect(getByAltText("image").getAttribute("src")).toEqual(
        "data:image/png;base64,iVBORw0KG...",
      )
    })

    it("renders an img tag with the correct src when given a link URL", () => {
      const props = { src: "https://example.com/image.jpg", alt: "image" }
      const { getByAltText } = render(<Image {...props} />)
      expect(getByAltText("image").getAttribute("src")).toEqual(
        "https://example.com/image.jpg",
      )
    })

    it("renders an Imgix component with the correct src when given a non-webp image", () => {
      const props = { src: "media/image.jpg", alt: "image" }
      const { getByAltText } = render(<Image {...props} />)
      expect(getByAltText("image").getAttribute("src")).toEqual(
        "https://nfid.imgix.net/media/image.jpg?auto=format",
      )
    })

    it("renders an Imgix component without src when given a non-webp image", () => {
      const props = { alt: "image" }
      const { getByAltText } = render(<Image {...props} />)
      expect(getByAltText("image").getAttribute("src")).toBeFalsy()
    })
  })

  describe("getImageUrl function", () => {
    beforeEach(() => {
      jest
        .spyOn(isProductionMock, "isProduction")
        .mockImplementation(() => true)
    })

    it("returns the correct URL when given a data URL", () => {
      const url = "data:image/png;base64,iVBORw0KG..."
      expect(getImageUrl(url)).toEqual(url)
    })

    it("returns the correct URL when given a link URL", () => {
      const url = "https://example.com/image.jpg"
      expect(getImageUrl(url)).toEqual(url)
    })

    it("returns the correct URL when given a production URL", () => {
      const url = "image.jpg"
      const expectedUrl = "https://nfid.imgix.net/image.jpg?auto=format"
      expect(getImageUrl(url)).toEqual(expectedUrl)
    })

    it("returns the correct URL when given a non-production URL", () => {
      jest
        .spyOn(isProductionMock, "isProduction")
        .mockImplementation(() => false)
      const url = "image.jpg"
      expect(getImageUrl(url)).toEqual(url)
    })

    it("returns the correct URL when given a webp image URL", () => {
      const url = "image.webp"
      const expectedUrl = "https://nfid.imgix.net/image.webp"
      expect(getImageUrl(url)).toEqual(expectedUrl)
    })
  })
})
