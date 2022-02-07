import React, { useEffect } from "react"
import clsx from "clsx"

interface IFrameWrapperProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  title?: string
}

export const IFrameScreen: React.FC<IFrameWrapperProps> = ({
  children,
  className,
  title,
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
    <div className={clsx("p-4", className)}>
      {children}
    </div>
  )
}
