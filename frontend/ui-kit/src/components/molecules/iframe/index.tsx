import clsx from "clsx"
import React, { useState } from "react"
import { HiX } from "react-icons/hi"
import { Card } from "../card"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  src: string
  inline?: boolean
  onLoad?: () => void
  height?: number
}

export const IFrame: React.FC<Props> = ({
  children,
  className,
  src,
  inline = false,
  height = 200,
  onLoad,
}) => {
  const [title, setTitle] = useState("")
  const [visible, setVisible] = useState(true)
  const [_height, setHeight] = useState(height)
  const [loading, setLoading] = useState(true)
  const origin = new URL(src).origin

  React.useEffect(() => {
    window.addEventListener("message", function (event) {
      if (event.origin !== origin) return

      const height = parseInt(event.data.height) + 57

      setTitle(event.data.title)
      setHeight(height > 200 ? height : 200)
    })
  }, [])

  const handleLoad = () => {
    setLoading(false)
    onLoad && onLoad()
  }

  React.useEffect(() => {
    setLoading(true)

    const timeout = setTimeout(() => setVisible(true), 500)
    return () => clearTimeout(timeout)
  }, [setLoading])

  return visible ? (
    <Card
      className={clsx(
        "bg-white shadow-xl max-w-screen rounded-xl w-full md:w-[390px] transition-all duration-300",
        "flex flex-col",
        className,
        !inline && "fixed bottom-0 right-0  md:top-[18px] md:right-7",
      )}
      style={{ height: _height }}
    >
      <div className="w-full  text-black overflow-hidden rounded-t-xl border-b border-gray-200 bg-white">
        <div
          className={clsx(
            title ? "justify-between" : "flex-row-reverse",
            "flex items-center h-full w-full p-4",
          )}
        >
          {title && (
            <div className="first-letter:capitalize font-medium">{title}</div>
          )}

          <HiX
            className="rounded-xl cursor-pointer text-2xl text-gray-400 hover:text-gray-500"
            onClick={() => setVisible(false)}
          />
        </div>
      </div>

      <iframe
        className={clsx(
          "w-full transition-all delay-300 h-full",
          loading && "opacity-0",
        )}
        src={src}
        frameBorder="0"
        title="idpWindow"
        name="idpWindow"
        width="100%"
        height="100%"
        allow="publickey-credentials-get"
        onLoad={() => {
          handleLoad()
        }}
      >
        {children}
      </iframe>
    </Card>
  ) : null
}
