import clsx from "clsx"
import { PropsWithChildren } from "react"

export interface ITransferTemplate extends PropsWithChildren {
  onClickOutside?: () => void
}

export const TransferTemplate: React.FC<ITransferTemplate> = ({
  children,
  onClickOutside,
}) => {
  return (
    <div
      className={clsx([
        "transition ease-in-out delay-150 duration-300",
        "z-40 top-0 left-0 w-full h-screen",
        "fixed bg-opacity-75 bg-gray-600",
      ])}
      style={{ margin: 0 }}
      onClick={onClickOutside}
    >
      <div
        className={clsx(
          "rounded-[24px] shadow-lg p-5 text-black overflow-hidden",
          "z-20 bg-white absolute flex flex-col",
          "left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2",
          "w-[95%] sm:w-[450px] h-[560px]",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
