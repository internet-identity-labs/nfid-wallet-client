import clsx from "clsx"
import React from "react"

import { profileSidebarItems } from "frontend/apps/identity-manager/profile/routes"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

import ProfileSidebarItem from "./sidebar-item"

interface IProfileSidebar extends React.HTMLAttributes<HTMLDivElement> {}

const ProfileSidebar: React.FC<IProfileSidebar> = ({ className }) => {
  const { navigate } = useNFIDNavigate()

  return (
    <div className={clsx("sticky top-4", className)}>
      {profileSidebarItems.map((item, index) => (
        <ProfileSidebarItem
          icon={item.icon}
          title={item.title}
          onClick={() => navigate(item.link)}
          key={`sidebarItem_${index}`}
          isActive={window.location.pathname === item.link}
        />
      ))}
    </div>
  )
}

export default ProfileSidebar
