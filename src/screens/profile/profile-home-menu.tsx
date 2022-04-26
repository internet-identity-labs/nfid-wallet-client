import { Menu, Transition } from "@headlessui/react"
import { DotsIcon } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"
import { Fragment } from "react"

import { useAuthentication } from "frontend/hooks/use-authentication"

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
        <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium bg-white rounded-md hover:bg-gray-50 focus:outline-none">
          <DotsIcon className="rotate-90" />
        </Menu.Button>
      </div>

      <Menu.Items className="absolute right-0 w-56 mt-2 overflow-hidden origin-top-right bg-white rounded-md shadow-lg">
        <div>
          <Menu.Item>
            {({ active }) => (
              <div
                onClick={logout}
                className={clsx(
                  active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                  "text-red-600 block px-4 py-2 text-sm",
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
