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
  const isData = src.startsWith("data")
  const isLink = src.startsWith("http")
  const isImgixApplied = !(isData || isLink || !isProduction())
  return isImgixApplied ? getImagixUrl(src) : src
}

function getImagixUrl(src: string): string {
  const slash = src.startsWith("/") ? "" : "/"
  const autoformat =
    src.endsWith("webp") || src.endsWith("svg") ? "" : "?auto=format"

  return `https://nfid.imgix.net${slash}${src}${autoformat}`
}
