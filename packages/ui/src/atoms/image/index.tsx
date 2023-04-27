import React from "react"

import { isProduction } from "../../utils/is-production"

export const Image = React.forwardRef<
  HTMLImageElement,
  React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >
>(({ src, alt, ...rest }, ref) => {
  return src ? (
    <img ref={ref} alt={alt} src={getImageUrl(src)} {...rest} />
  ) : (
    <img ref={ref} alt={alt} {...rest} />
  )
})

export const getImageUrl = (src: string): string => {
  const isData = (x: string) => x.startsWith("data")
  const isLink = (x: string) => x.startsWith("http")
  const isWebp = (x: string) => x.endsWith("webp")
  return isData(src) || isLink(src) || !isProduction()
    ? src
    : "https://nfid.imgix.net/" + src + (isWebp(src) ? "" : "?auto=format")
}
