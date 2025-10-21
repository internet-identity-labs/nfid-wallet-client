import clsx from "clsx"
import { PropsWithChildren } from "react"

export interface ITransferTemplate extends PropsWithChildren {
  onClickOutside?: () => void
  className?: string
  overlayClassName?: string
  isOpen: boolean
}

export const TransferTemplate: React.FC<ITransferTemplate> = ({
  children,
  onClickOutside,
  className,
  overlayClassName,
  isOpen,
}) => {
  return (
    <>
      {isOpen && (
        <div
          className={clsx(
            "transition ease-in-out delay-150 duration-300",
            "z-40 top-0 left-0 w-full h-screen",
            "fixed bg-opacity-80 bg-[#18181B] flex",
            overlayClassName,
          )}
          style={{ margin: 0 }}
          onClick={onClickOutside}
        >
          <div
            className={clsx(
              "rounded-[24px] shadow-lg px-5 pb-5 pt-[18px] text-black dark:text-white dark:bg-zinc-800 overflow-hidden",
              "z-20 bg-white relative border border-gray-100 dark:border-transparent",
              "m-auto",
              "w-[340px] sm:w-[450px]",
              className,
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </div>
        </div>
      )}
    </>
  )
}
