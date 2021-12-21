import clsx from "clsx"
import React, { useState } from "react"

interface IFrameContentProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  onLoad?: () => void
  src: string
}

export const IFrameContent: React.FC<IFrameContentProps> = ({
  children,
  className,
  onLoad,
  src,
}) => {
  const [loading, setLoading] = useState(true)

  return (
    <iframe
      className={clsx(
        "w-full transition-all delay-300 h-full",
        loading && "opacity-0",
      )}
      src={src}
      frameBorder="0"
      title="idpWindow"
      name="idpWindow"
      allow="publickey-credentials-get"
      onLoad={() => {
        setLoading(false)
        onLoad && onLoad()
      }}
    />
  )
}
