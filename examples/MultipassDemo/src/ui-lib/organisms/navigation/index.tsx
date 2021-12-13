import React from "react"

interface NavigationProps {
  staticBackground?: boolean
}

export const Navigation: React.FC<NavigationProps> = () => {
  return (
    <nav className="w-full flex fixed bg-gray-100 m-auto">
      <div className="w-full md:max-w-7xl m-auto p-4 md:p-6 xl:py-8 md:m-auto lg:m-auto flex justify-between">
        <div className="uppercase font-lato font-bold tracking-widest text-lg">
          Multipass Demo 1
        </div>
      </div>
    </nav>
  )
}
