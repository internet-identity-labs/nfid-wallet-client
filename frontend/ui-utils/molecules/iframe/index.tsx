import React from "react"
import clsx from "clsx"
import { Card } from "../card"
import { CardBody } from "../card/body"
import { CloseIcon } from "frontend/ui-utils/atoms/icons/close"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  title?: string
}

export const IFrame: React.FC<Props> = ({ children, className, title }) => {
  return (
    <Card className="bg-transparent md:bg-white px-4 md:px-0 shadow-xl fixed bottom-0 right-0  md:top-10 md:right-10 w-full max-w-screen md:max-w-xl rounded-xl overflow-hidden max-h-[25rem] h-full">
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
          <CloseIcon className="hover:bg-gray-200 rounded-xl p-[1px]" />
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
