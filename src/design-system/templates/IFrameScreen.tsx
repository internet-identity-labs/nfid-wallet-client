import React, { useEffect } from "react"
import clsx from "clsx"
import { Logo, NFIDGradientBar } from "frontend/ui-kit/src"

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
      <NFIDGradientBar />

      {logo && <Logo className="pt-6 px-5" />}

      <div className={clsx("p-5 relative", className)}>{children}</div>
    </div>
  )
}
