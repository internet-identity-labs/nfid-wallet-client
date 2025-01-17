import clsx from "clsx"
import { PropsWithChildren } from "react"

export interface ITransferTemplate extends PropsWithChildren {
  onClickOutside?: () => void
  className?: string
  overlayClassName?: string
}

export const TransferTemplate: React.FC<ITransferTemplate> = ({
  children,
  onClickOutside,
  className,
  overlayClassName,
}) => {
  return (
    <div
      className={clsx([
        "transition ease-in-out delay-150 duration-300",
        "z-40 top-0 left-0 w-full h-screen",
        "fixed bg-opacity-75 bg-gray-600 flex",
        overlayClassName,
      ])}
      style={{ margin: 0 }}
      onClick={onClickOutside}
    >
      <div
        className={clsx(
          "rounded-[24px] shadow-lg px-5 pb-[84px] pt-[18px] text-black",
          "z-20 bg-white relative border border-gray-100",
          "m-auto",
          "w-[340px] sm:w-[450px]",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
