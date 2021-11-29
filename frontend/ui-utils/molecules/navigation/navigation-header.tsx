import React from "react"

interface Props {
  title: string
  description?: string
}

export const NavigationHeader: React.FC<Props> = ({ title, description }) => {
  return (
    <div className="w-full bg-gray-50 p-6">
      <div className="container xl:max-w-7xl mx-auto px-4 lg:px-8">
        <h1 className="text-gray-700 font-bold text-lg capitalize">
          {title}
        </h1>
        {description && <p className="text-gray-500">{description}</p>}
      </div>
    </div>
  )
}
