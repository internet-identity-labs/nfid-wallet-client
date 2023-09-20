import React from "react"

import { NFIDLogo } from "@nfid-frontend/ui"

export type SubPoint = {
  id: string
  name: string
}

export type Section = {
  id: string
  name: string
  subPoints?: SubPoint[]
}

export type SideNavProps = {
  sections: Section[]
  activeSection: string
  activeSubPoint?: string
}

const SideNav: React.FC<SideNavProps> = ({
  sections,
  activeSection,
  activeSubPoint,
}) => {
  return (
    <div className="relative h-full p-5 bg-gray-50">
      <ul className="sticky top-5">
        <li className="flex items-center mb-5 ml-5 text-xl font-bold">
          <NFIDLogo /> Playground
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
            {section.subPoints && (
              <ul className="pl-5 text-[13px]">
                {section.subPoints.map((subPoint) => (
                  <li key={subPoint.id} className="my-1">
                    <a
                      href={`#${subPoint.id}`}
                      className={`block py-1 px-5 rounded-lg 
                                ${
                                  activeSubPoint === subPoint.id
                                    ? "text-blue-400"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                    >
                      {subPoint.name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SideNav
