import clsx from "clsx"
import React from "react"

interface NavigationItemsProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const NavigationItems: React.FC<NavigationItemsProps> = ({
  children,
  className,
}) => {
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
    <div className={clsx("flex items-center space-x-4", className)}>
      {items.map((item, index) => (
        <div
          className="text-gray-600 hover:text-gray-800 hover:underline decoration-dashed hover:underline-offset-2 cursor-pointer"
          onClick={(el) => handleGoTo(el, item.to)}
          key={index}
        >
          {item.label}
        </div>
      ))}
    </div>
  )
}
