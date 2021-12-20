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
      className="text-sm font-medium text-center flex items-center space-x-2 lg:px-2 px-1 py-2 rounded text-black hover:text-indigo-700 capitalize"
    >
      <span>{text}</span>
    </Link>
  )
}
