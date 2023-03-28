import { isProduction } from "../../utils/is-production"

export const Image = ({ src, ...rest }: any) => {
  return src ? <img src={getImageUrl(src)} {...rest} /> : <img {...rest} />
}

export const getImageUrl = (src: string): string => {
  const isData = (x: string) => x.startsWith("data")
  const isLink = (x: string) => x.startsWith("http")
  const isWebp = (x: string) => x.endsWith("webp")
  return isData(src) || isLink(src) || !isProduction()
    ? src
    : "https://nfid.imgix.net/" + src + (isWebp(src) ? "" : "?auto=format")
}
