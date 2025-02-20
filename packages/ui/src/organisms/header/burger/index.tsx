import clsx from "clsx"

export interface BurgerMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpened: boolean
  isLanding?: boolean
}

export const BurgerMenu: React.FC<BurgerMenuProps> = ({
  isOpened,
  isLanding,
  ...props
}) => {
  return (
    <div className="cursor-pointer w-[24px] h-[24px] relative" {...props}>
      <span
        className={clsx(
          "absolute w-full top-[3px] left-0 h-[2px] bg-gray-700",
          "transition-transform transition-top duration-300 ease-in-out",
          isOpened && "!top-[11px] rotate-[-45deg]",
          isLanding && "!bg-white",
        )}
      ></span>
      <span
        className={clsx(
          "absolute w-[21px] top-[11px] left-0 h-0.5 bg-gray-700",
          "transition-opacity duration-300 ease-in-out",
          isOpened && "top-0 opacity-0",
          isLanding && "!bg-white",
        )}
      ></span>
      <span
        className={clsx(
          "absolute w-full bottom-[3px] left-0 h-[2px] bg-gray-700",
          "transition-transform transition-top duration-300 ease-in-out",
          isOpened && "!top-[11px] rotate-[45deg]",
          isLanding && "!bg-white",
        )}
      ></span>
    </div>
  )
}

export default BurgerMenu
