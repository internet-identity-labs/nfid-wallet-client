import { ButtonMenu, DotsIcon } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { ElementProps } from "frontend/types/react"

interface ProfileHomeMenuProps extends ElementProps<HTMLDivElement> {}

export const ProfileHomeMenu: React.FC<ProfileHomeMenuProps> = ({
  className,
  children,
}) => {
  const { logout } = useAuthentication()

  return (
    <div className={clsx("", className)}>
      <ButtonMenu
        buttonElement={<DotsIcon className="rotate-90" />}
        className="mx-7"
      >
        {(toggle: () => void) => (
          <>
            <li
              className="cursor-pointer hover:bg-gray-200"
              onClick={(e) => {
                e.stopPropagation()
                toggle()

                // TODO: navigate to Edit Profile
              }}
            >
              <div className="block px-4 py-2 text-sm">Edit Profile</div>
            </li>
            <li
              className="cursor-pointer hover:bg-gray-200 text-red-base"
              onClick={(e) => {
                e.stopPropagation()
                toggle()
                logout()
              }}
            >
              <div className="block px-4 py-2 text-sm">Sign out</div>
            </li>
          </>
        )}
      </ButtonMenu>
    </div>
  )
}
