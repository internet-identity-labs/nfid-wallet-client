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
      <h3 className="text-lg leading-6 font-medium text-gray-800">
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          { description}
        </p>
      )}
    </div>
  )
}
