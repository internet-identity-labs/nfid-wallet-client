import React from "react"
import clsx from "clsx"
import { Card } from "../card"
import { HiX } from "react-icons/hi"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  title?: string
  src: string
  inline?: boolean
}

export const IFrame: React.FC<Props> = ({
  children,
  className,
  title,
  src,
  inline = false,
}) => {
  return (
    <Card
      className={clsx(
        "bg-transparent md:bg-white shadow-xl w-full max-w-screen md:max-w-xl rounded-xl overflow-hidden max-h-[25rem] h-full",
        className,
        !inline && "fixed bottom-0 right-0  md:top-10 md:right-10",
      )}
    >
      <div className="w-full h-14 bg-white text-black border border-b-0 overflow-hidden rounded-t-xl">
        <div
          className={clsx(
            title ? "justify-between" : "flex-row-reverse",
            "flex items-center h-full w-full px-4",
          )}
        >
          {title && (
            <div className="first-letter:capitalize font-medium">{title}</div>
          )}

          {/* TODO: send event to parent when clicked */}
          <HiX className="hover:bg-gray-200 rounded-xl p-[1px] cursor-pointer text-2xl text-gray-500 hover:text-gray-600" />
        </div>
      </div>

      <iframe
        className={clsx("w-full h-[calc(100%-56px)]", className)}
        src={src}
        frameBorder="0"
        title={title}
      >
        {children}
      </iframe>
    </Card>
  )
}
