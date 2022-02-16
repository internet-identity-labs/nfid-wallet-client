import React, { useEffect } from "react"
import clsx from "clsx"
import { Logo } from "frontend/ui-kit/src"

interface IFrameWrapperProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  title?: string
  logo?: boolean
}

export const IFrameScreen: React.FC<IFrameWrapperProps> = ({
  children,
  className,
  title,
  logo,
}) => {
  const nfidGradientBar = {
    background: `linear-gradient(
      90deg,
      #3dedd7 0%,
      #02cdfe 25%,
      #3781f4 50.52%,
      #7063ff 76.04%,
      #cc5cdc 100%
    )`,
  }

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
    <div className="relative">
      <div
        className="absolute top-0 h-[4px] rounded-b w-[90%] inset-0 mx-auto"
        style={nfidGradientBar}
      />

      {logo && <Logo className="pt-6 px-5" />}

      <div className={clsx("p-5 relative", className)}>{children}</div>
    </div>
  )
}
