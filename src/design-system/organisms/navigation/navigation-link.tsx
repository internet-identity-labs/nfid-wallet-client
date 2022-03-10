import React from "react"
import { Link } from "react-router-dom"

interface Props {
  href: string
  text: string
}

export const NavigationLink: React.FC<Props> = ({ href = "#", text }) => {
  return (
    <Link
      to={href}
      className="flex items-center px-1 py-2 text-sm font-medium text-center text-black capitalize rounded space-x-2 lg:px-2 hover:text-indigo-700"
    >
      <span>{text}</span>
    </Link>
  )
}
