import clsx from "clsx"
import React from "react"

export interface ButtonMenuProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  children: (toggle: () => void) => React.ReactNode
  buttonElement?: React.ReactElement | string
}

export const ButtonMenu: React.FC<ButtonMenuProps> = ({
  children,
  className,

  buttonElement,
}) => {
  const [toggleMenu, setToggleMenu] = React.useState(false)
  const ref = React.useRef<HTMLDivElement | null>(null)

  const handleMenuToggle = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
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
      <div
        onClick={(e) => handleMenuToggle(e)}
        className={clsx(
          "relative !p-1 z-30 transition-all duration-500",
          toggleMenu ? "rotate-0" : "rotate-180",
          className,
        )}
      >
        {buttonElement}
      </div>

      {toggleMenu && (
        <div
          className="absolute top-0 left-0 z-[1] block w-full h-screen bg-black bg-opacity-25 overflow-hidden"
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
        {children(() => setToggleMenu(false))}
      </div>
    </div>
  )
}
