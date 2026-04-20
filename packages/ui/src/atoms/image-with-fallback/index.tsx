import { HTMLAttributes, useEffect, useState } from "react"

export interface IImageWithFallbackProps extends HTMLAttributes<HTMLImageElement> {
  src?: string
  fallbackSrc: string | { src: string }
  alt?: string
}

const resolveFallback = (fallbackSrc: string | { src: string }) =>
  typeof fallbackSrc === "object" ? fallbackSrc.src : fallbackSrc

/** Avoids loading `/undefined` when callers stringify missing URLs with template literals. */
const effectiveImageSrc = (
  src: string | undefined,
  fallbackSrc: string | { src: string },
) => (src && src !== "undefined" ? src : resolveFallback(fallbackSrc))

export const ImageWithFallback = ({
  src,
  fallbackSrc,
  alt,
  className,
}: IImageWithFallbackProps) => {
  const [imgSrc, setImgSrc] = useState(() =>
    effectiveImageSrc(src, fallbackSrc),
  )

  const handleError = () => {
    setImgSrc(resolveFallback(fallbackSrc))
  }

  useEffect(() => {
    setImgSrc(effectiveImageSrc(src, fallbackSrc))
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
