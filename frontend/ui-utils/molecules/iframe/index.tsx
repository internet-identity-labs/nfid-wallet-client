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
}

export const IFrame: React.FC<Props> = ({ children, className, title }) => {
  return (
    <Card className="bg-transparent md:bg-white shadow-xl fixed bottom-0 right-0  md:top-10 md:right-10 w-full max-w-screen md:max-w-xl rounded-xl overflow-hidden max-h-[25rem] h-full">
      <div className="w-full h-14 bg-white text-black border-b-0 border overflow-hidden rounded-t-xl">
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
        src="https://dfinity.org/"
        frameBorder="0"
        title={title}
      >
        {children}
      </iframe>
    </Card>
  )
}
