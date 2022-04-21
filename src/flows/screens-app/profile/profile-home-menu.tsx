import clsx from "clsx"
import React from "react"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { ElementProps } from "frontend/types/react"
import { DotsIcon } from "frontend/ui-kit/src/components/atoms/button/icons/dots"
import { ButtonMenu } from "frontend/ui-kit/src/components/atoms/button/menu"

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
        {(toggle) => (
          <>
            <li
              className="hover:bg-gray-200 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                toggle()

                // TODO: navigate to Edit Profile
              }}
            >
              <div className="block px-4 py-2 text-sm">Edit Profile</div>
            </li>
            <li
              className="hover:bg-gray-200 text-red-base cursor-pointer"
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
