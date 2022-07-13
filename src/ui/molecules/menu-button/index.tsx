import { Menu, Transition } from "@headlessui/react"
import clsx from "clsx"
import React from "react"
import { Fragment } from "react"
import { FaChevronCircleDown } from "react-icons/fa"

interface MenuButtonProps {
  items: string[]
}

export const MenuButton: React.FC<MenuButtonProps> = ({ items }) => {
  return (
    <Menu as="div" className="inline-block relative text-left">
      <div>
        <Menu.Button className="inline-flex justify-center px-4 py-2 w-full text-sm font-medium text-gray-700 bg-white rounded-md border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
          <FaChevronCircleDown
            className="-mr-1 ml-2 w-5 h-5"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 bg-white rounded-md ring-1 ring-black ring-opacity-5 shadow-lg origin-top-right focus:outline-none">
          <div className="py-1">
            {items.map((item) => (
              <Menu.Item>
                {({ active }) => (
                  <div
                    className={clsx(
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                      "block px-4 py-2 text-sm",
                    )}
                  >
                    {item}
                  </div>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
