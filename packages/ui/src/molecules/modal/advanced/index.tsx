import clsx from "clsx"
import { CloseIcon } from "@nfid/ui/atoms/icons/close-button"
import React from "react"

import { H5 } from "@nfid/ui/atoms/typography"
import { Button } from "@nfid/ui/molecules/button"

export interface ModalButtonProps {
  text: string
  onClick: () => void
  type: "primary" | "secondary" | "red"
  block?: boolean
}

export interface ModalAdvancedProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subTitle?: string | JSX.Element
  onClose?: () => void
  primaryButton?: ModalButtonProps
  secondaryButton?: ModalButtonProps
  large?: boolean
  backgroundClassnames?: string
  buttonsClassNames?: string
}

export const ModalAdvanced: React.FC<ModalAdvancedProps> = ({
  children,
  className,
  title,
  subTitle,
  onClose,
  primaryButton,
  secondaryButton,
  large,
  backgroundClassnames = "opacity-5",
  buttonsClassNames,
}) => {
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center mx-4 overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
        <div
          className={clsx(
            "relative w-full mx-auto my-6",
            large ? "max-w-sm md:max-w-lg" : "max-w-sm",
          )}
        >
          <div className="relative flex flex-col w-full bg-white border-0 rounded-[24px] shadow-lg outline-none focus:outline-none">
            <div className="relative flex-auto px-6 ">
              <H5 className="mt-4">{title}</H5>
              <p className="my-4 text-sm">{subTitle}</p>
              <div className={clsx("", className)}>{children}</div>
            </div>

            <div
              className={clsx("grid grid-cols-2 p-6 gap-4", buttonsClassNames)}
            >
              {secondaryButton && (
                <Button
                  type="stroke"
                  block
                  className={clsx("!py-3 !px-8")}
                  onClick={secondaryButton?.onClick}
                >
                  {secondaryButton?.text}
                </Button>
              )}

              {primaryButton && (
                <Button
                  type={primaryButton.type}
                  className={clsx("!py-3 !px-8")}
                  onClick={primaryButton.onClick}
                  block
                >
                  {primaryButton.text}
                </Button>
              )}
            </div>
          </div>

          {onClose && (
            <div className={clsx("absolute top-5 right-5")} onClick={onClose}>
              <CloseIcon />
            </div>
          )}
        </div>
      </div>
      <div
        className={clsx("fixed inset-0 z-40 bg-black", backgroundClassnames)}
      ></div>
    </>
  )
}
