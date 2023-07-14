import clsx from "clsx"
import React from "react"

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose: () => void
  isVisible?: boolean
}

export const ModalComponent: React.FC<ModalProps> = ({
  children,
  className,
  isVisible,
  onClose,
}) => {
  return (
    <div
      onClick={onClose}
      className={clsx([
        "transition ease-in-out delay-150 duration-300",
        "z-50 top-0 right-0 bottom-0 left-0",
        isVisible ? "fixed bg-opacity-75 bg-gray-200" : "bg-transparent",
      ])}
    >
      <div
        className={clsx([
          "transition ease-in-out delay-150 duration-300",
          "fixed top-[50%] right-[50%] bottom-[50%] left-[50%]",
          "transform -translate-x-2/4 -translate-y-2/4",
          "md:rounded-md drop-shadow-lg",
          "min-w-min min-h-min bg-white",
          isVisible ? "scale-100" : "scale-0",
          className,
        ])}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
