import React from "react"

interface Props {
  title: string
  description?: string
}

export const NavigationHeader: React.FC<Props> = ({ title, description }) => {
  return (
    <div className="w-full p-6 bg-gray-50">
      <div className="container px-4 mx-auto xl:max-w-7xl lg:px-8">
        <h1 className="text-lg font-bold text-gray-700 capitalize">{title}</h1>
        {description && <p className="text-gray-500">{description}</p>}
      </div>
    </div>
  )
}
