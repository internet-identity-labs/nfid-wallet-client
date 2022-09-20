import clsx from "clsx"
import React from "react"

import { profileSidebarItems } from "frontend/apps/identity-manager/profile/routes"

import ProfileSidebarItem from "./sidebar-item"

interface IProfileSidebar extends React.HTMLAttributes<HTMLDivElement> {
  id: string
}

const ProfileSidebar: React.FC<IProfileSidebar> = ({ id, className }) => {
  return (
    <div id={id} className={clsx("sticky top-4", className)}>
      {profileSidebarItems.map((item, index) => (
        <ProfileSidebarItem
          icon={item.icon}
          title={item.title}
          to={item.link}
          key={`sidebarItem_${index}`}
          isActive={window.location.pathname.includes(item.link)}
          id={item.id}
        />
      ))}
    </div>
  )
}

export default ProfileSidebar
