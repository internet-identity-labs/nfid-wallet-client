import clsx from "clsx"
import React from "react"

import { Button, ButtonProps } from "../button"

export interface ButtonMenuProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  children: (toggle: () => void) => React.ReactNode
  buttonProps?: ButtonProps
  buttonElement?: React.ReactElement | string
}

export const ButtonMenu: React.FC<ButtonMenuProps> = ({
  children,
  className,
  buttonProps,
  buttonElement,
}) => {
  const [toggleMenu, setToggleMenu] = React.useState(false)
  const ref = React.useRef<HTMLDivElement | null>(null)

  const handleMenuToggle = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.stopPropagation()
      setToggleMenu(!toggleMenu)
    },
    [toggleMenu],
  )

  React.useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setToggleMenu(false)
      }
    }
    document.addEventListener("click", handleClickOutside, true)
    return () => {
      document.removeEventListener("click", handleClickOutside, true)
    }
  }, [])

  return (
    <div ref={ref} className={clsx("overflow-hidden h-auto")}>
      <Button
        {...buttonProps}
        onClick={(e) => handleMenuToggle(e)}
        className={clsx("relative !p-1 transition-all duration-500", className)}
      >
        {buttonElement}
      </Button>

      {toggleMenu && (
        <div
          className="absolute top-0 left-0 z-[1] block w-full h-screen bg-black-base bg-opacity-25 overflow-hidden"
          onClick={() => setToggleMenu(false)}
        />
      )}

      <div
        className={clsx(
          "z-10 h-screen text-base list-none bg-white shadow-md rounded absolute right-0 top-0 transition-all ease-in duration-500",
          toggleMenu ? "translate-x-0" : "translate-x-[120%]",
          className,
        )}
      >
        <Button
          {...buttonProps}
          onClick={(e) => handleMenuToggle(e)}
          className={clsx(
            "absolute left-0 top-4 transition-all duration-500 rotate-180",
            className,
          )}
        >
          {buttonElement}
        </Button>
        {children(() => setToggleMenu(false))}
      </div>
    </div>
  )
}
