import React from "react"

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
    <div className="h-screen p-5 overflow-y-auto bg-gray-100 border-r">
      <ul>
        {sections.map((section) => (
          <li key={section.id} className="my-2 text-sm">
            <a
              href={`#${section.id}`}
              className={`block px-5 py-2 rounded-lg 
                                ${
                                  activeSection === section.id
                                    ? "text-blue-500"
                                    : "text-gray-700 hover:bg-gray-200"
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
                                    : "text-gray-600 hover:bg-gray-200"
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
