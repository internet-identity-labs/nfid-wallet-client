import { HTMLAttributes, useEffect, useState } from "react"

export interface IImageWithFallbackProps
  extends HTMLAttributes<HTMLImageElement> {
  src?: string
  fallbackSrc: string | { src: string }
  alt?: string
}

export const ImageWithFallback = ({
  src,
  fallbackSrc,
  alt,
  className,
}: IImageWithFallbackProps) => {
  const [imgSrc, setImgSrc] = useState(src)

  const handleError = () => {
    setImgSrc(typeof fallbackSrc === "object" ? fallbackSrc.src : fallbackSrc)
  }

  useEffect(() => {
    setImgSrc(src)
  }, [src])

  return (
    <img
      className={className}
      src={imgSrc}
      onError={handleError}
      alt={alt || ""}
    />
  )
}

export default ImageWithFallback
