import React from "react"
import clsx from "clsx"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  title: string
  description?: string
}

export const ListItemHead: React.FC<Props> = ({
  children,
  className,
  title,
  description,
}) => {
  return (
    <div className={clsx("px-4 py-5 sm:px-6 border-b w-full", className)}>
      <h3 className="text-lg font-medium text-gray-800 leading-6">
        {title}
      </h3>
      {description && (
        <p className="max-w-2xl mt-1 text-sm text-gray-500">
          { description}
        </p>
      )}
    </div>
  )
}
