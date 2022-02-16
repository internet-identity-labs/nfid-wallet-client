import React from "react"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  onClick?: () => void
}

export const MenuItem: React.FC<Props> = ({
  icon,
  title,
  subtitle,
  onClick,
}) => {
  return (
    <div
      className="flex items-center px-5 py-2 cursor-pointer space-x-2 text-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      onClick={onClick}
    >
      {icon && icon}
      <span className="flex flex-col">
        <span>{title}</span>
        {subtitle && <span className="text-gray-400 text-xs">{subtitle}</span>}
      </span>
    </div>
  )
}
