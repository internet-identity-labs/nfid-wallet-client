import clsx from "clsx"
import { PropsWithChildren } from "react"

export interface ITransferTemplate extends PropsWithChildren {
  onClickOutside?: () => void
  className?: string
}

export const TransferTemplate: React.FC<ITransferTemplate> = ({
  children,
  onClickOutside,
  className,
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
          "rounded-[24px] shadow-lg px-5 pb-[84px] pt-[18px] text-black overflow-hidden",
          "z-20 bg-white absolute border border-gray-100",
          "left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2",
          "w-[340px] sm:w-[450px] min-h-[480px]",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
