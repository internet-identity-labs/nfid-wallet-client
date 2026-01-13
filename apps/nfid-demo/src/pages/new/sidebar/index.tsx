import React from "react"

import { NFIDLogoPlayground } from "@nfid/ui"

export type Section = {
  id: string
  name: string
}

export type SideNavProps = {
  sections: Section[]
  activeSection: string
}

const SideNav: React.FC<SideNavProps> = ({ sections, activeSection }) => {
  return (
    <div className="relative hidden h-full p-5 bg-gray-50 md:block">
      <ul className="sticky top-5">
        <li className="flex items-center mb-5 ml-5 text-xl font-bold">
          <NFIDLogoPlayground />
        </li>
        {sections.map((section) => (
          <li key={section.id} className="my-1 text-sm">
            <a
              href={`#${section.id}`}
              className={`block px-5 py-2.5 rounded-lg  font-semibold
                                ${
                                  activeSection === section.id
                                    ? "text-blue-500 bg-gray-200 cursor-default pointer-events-none"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`}
            >
              {section.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SideNav
