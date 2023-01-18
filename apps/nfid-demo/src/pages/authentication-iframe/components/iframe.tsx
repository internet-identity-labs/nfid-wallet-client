import clsx from "clsx"
import React from "react"

interface IFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string
  onLoad?: () => void
}

export const IFrame: React.FC<IFrameProps> = ({ className, src, onLoad }) => {
  const [isLoading, setLoading] = React.useState(true)

  const handleOnLoad = React.useCallback(() => {
    setLoading(false)
    onLoad && onLoad()
  }, [onLoad])

  return (
    <iframe
      className={clsx(
        "w-full transition-all delay-300 h-full",
        isLoading && "opacity-0",
        className,
      )}
      src={src}
      frameBorder="0"
      title="iiIdpWindow"
      name="iiIdpWindow"
      allow="publickey-credentials-get"
      onLoad={handleOnLoad}
    />
  )
}
