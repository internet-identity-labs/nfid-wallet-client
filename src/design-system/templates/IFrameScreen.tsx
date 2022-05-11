import { Logo, NFIDGradientBar } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React, { useEffect } from "react"

interface IFrameWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  logo?: boolean
}

export const IFrameScreen: React.FC<IFrameWrapperProps> = ({
  children,
  className,
  title,
  logo,
}) => {
  const ref = React.useRef(0)

  useEffect(() => {
    const timeout = setInterval(() => {
      const newHeight = window.document.body.clientHeight

      if (ref.current !== newHeight) {
        window.parent.postMessage({ height: newHeight, title: title }, "*")
        ref.current = newHeight
      }
    }, 200)

    return () => clearInterval(timeout)
  }, [title])
  return (
    <div className="relative min-h-[510px]">
      <NFIDGradientBar />

      {logo && <Logo className="px-5 pt-6" />}

      <div className={clsx("p-5 relative", className)}>{children}</div>
    </div>
  )
}
