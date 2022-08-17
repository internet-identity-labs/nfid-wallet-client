import clsx from "clsx"
import React from "react"

import { profileSidebarItems } from "frontend/apps/identity-manager/profile/routes"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

import ProfileSidebarItem from "./sidebar-item"

interface IProfileSidebar extends React.HTMLAttributes<HTMLDivElement> {
  onHelpClick?: () => void
  onSignOut?: () => void
}

const ProfileSidebar: React.FC<IProfileSidebar> = ({
  onHelpClick,
  onSignOut,
}) => {
  const { navigate } = useNFIDNavigate()

  return (
    <div className={clsx("sticky top-4")}>
      {profileSidebarItems.map((item, index) => (
        <ProfileSidebarItem
          icon={item.icon}
          title={item.title}
          onClick={() => navigate(item.link)}
          key={`sidebarItem_${index}`}
          isActive={window.location.pathname === item.link}
        />
      ))}
      {onHelpClick && onSignOut && (
        <div>
          <ProfileSidebarItem
            className="text-sm font-normal text-gray-500"
            title="Help"
            onClick={onHelpClick}
          />
          <ProfileSidebarItem
            className="text-sm font-normal text-gray-500"
            title="Sign out"
            onClick={onSignOut}
          />
        </div>
      )}
    </div>
  )
}

export default ProfileSidebar
