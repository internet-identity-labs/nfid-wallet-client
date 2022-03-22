import clsx from "clsx"
import React from "react"
import { HiMenu } from "react-icons/hi"

import { ButtonMenu } from "frontend/ui-kit/src/components/atoms/button/menu"

interface NavigationItemsProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const NavigationItems: React.FC<NavigationItemsProps> = ({
  children,
  className,
}) => {
  const classes = {
    navItem:
      "text-gray-600 hover:text-gray-800 hover:underline decoration-dashed hover:underline-offset-4 cursor-pointer",
  }

  const items = [
    {
      label: "Home",
      to: "home",
    },
    {
      label: "Our mission",
      to: "our-mission",
    },
    {
      label: "Partners",
      to: "partners",
    },
    {
      label: "F.A.Q.",
      to: "faq",
    },
  ]

  const handleGoTo = (e: any, item: any) => {
    e.preventDefault()

    const element = document.getElementById(item)

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  return (
    <>
      <div className="md:hidden relative">
        <ButtonMenu
          buttonElement={<HiMenu className="w-6 h-6 text-gray-500" />}
        >
          {(toggleMenu) => (
            <div className="p-4 py-6 bg-white rounded shadow-lg w-48 space-y-2">
              {items.map((item, index) => (
                <div
                  className={classes.navItem}
                  onClick={(el) => {
                    el.stopPropagation()
                    handleGoTo(el, item.to)
                    toggleMenu()
                  }}
                  key={index}
                >
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </ButtonMenu>
      </div>

      <div className="hidden md:flex items-center space-x-4">
        {items.map((item, index) => (
          <div
            className={classes.navItem}
            onClick={(el) => handleGoTo(el, item.to)}
            key={index}
          >
            {item.label}
          </div>
        ))}
      </div>
    </>
  )
}
