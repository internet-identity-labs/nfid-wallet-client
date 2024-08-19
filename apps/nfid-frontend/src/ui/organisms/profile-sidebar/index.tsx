import clsx from "clsx"
import React, { useMemo } from "react"
import useSWR from "swr"

import { profileSidebarItems } from "frontend/apps/identity-manager/profile/routes"
import { useVaultMember } from "frontend/features/vaults/hooks/use-vault-member"
import { getAllVaults } from "frontend/features/vaults/services"

import ProfileSidebarItem from "./sidebar-item"

interface IProfileSidebar extends React.HTMLAttributes<HTMLDivElement> {
  id: string
}

const ProfileSidebar: React.FC<IProfileSidebar> = ({ id, className }) => {
  const { data: vaults } = useSWR(["vaults"], getAllVaults)

  const filteredProfileSidebarItems = useMemo(() => {
    if (!vaults || vaults.length === 0) {
      return profileSidebarItems.filter((item) => item.id !== "profile-vaults")
    } else {
      return profileSidebarItems
    }
  }, [vaults])

  return (
    <div id={id} className={clsx("sticky top-4", className)}>
      {filteredProfileSidebarItems.map((item, index) => (
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
