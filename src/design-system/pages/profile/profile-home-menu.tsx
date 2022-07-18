import { Menu } from "@headlessui/react"
import clsx from "clsx"
import React from "react"
import { Link } from "react-router-dom"

import { DotsIcon } from "@internet-identity-labs/nfid-sdk-react"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"

interface MenuButtonProps {
  className?: string
}

export const ProfileHomeMenu: React.FC<MenuButtonProps> = ({ className }) => {
  const { logout } = useAuthentication()
  return (
    <Menu
      as="div"
      className={clsx(className, "relative inline-block text-left")}
      style={{ zIndex: 1 }}
    >
      <div>
        <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium rounded-md sm:bg-white hover:bg-gray-50 focus:outline-none">
          <DotsIcon className="rotate-90" />
        </Menu.Button>
      </div>

      <Menu.Items className="absolute right-0 w-56 mt-2 overflow-hidden origin-top-right bg-white rounded-md shadow-lg">
        <div>
          <Menu.Item>
            {({ active }) => (
              <Link
                to={`${ProfileConstants.base}/${ProfileConstants.edit}`}
                className={clsx(
                  active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                  "block px-4 py-2 text-sm cursor-pointer",
                )}
              >
                Edit profile
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <div
                onClick={logout}
                className={clsx(
                  active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                  "text-red-600 block px-4 py-2 text-sm cursor-pointer",
                )}
              >
                Log out
              </div>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  )
}
