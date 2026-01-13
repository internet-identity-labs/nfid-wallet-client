import * as RadixDialog from "@radix-ui/react-dialog"
import clsx from "clsx"
import React from "react"

import { Loader } from "@nfid/ui/atoms/loader"
import { H5 } from "@nfid/ui/atoms/typography"
import { Button } from "@nfid/ui/molecules/button"

export interface ModalButtonProps {
  text: string
  onClick?: () => void
  type: "primary" | "secondary" | "red" | "stroke"
  block?: boolean
  id?: string
}

export interface ModalAdvancedProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subTitle?: string | JSX.Element
  primaryButton?: ModalButtonProps
  secondaryButton?: ModalButtonProps
  large?: boolean
  buttonsClassNames?: string
  trigger?: JSX.Element
  isLoading?: boolean
  isModalOpen?: boolean
  isModalOpenChange?: (open: boolean) => void
}

export const ModalAdvanced: React.FC<ModalAdvancedProps> = ({
  children,
  className,
  title,
  subTitle,
  primaryButton,
  secondaryButton,
  large,
  buttonsClassNames,
  trigger,
  isLoading = false,
  isModalOpen,
  isModalOpenChange,
}) => {
  return (
    <RadixDialog.Root open={isModalOpen} onOpenChange={isModalOpenChange}>
      <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>
      <RadixDialog.Portal>
        <RadixDialog.Overlay
          className={clsx("fixed inset-0 bg-black bg-opacity-40")}
        />
        {isLoading && <Loader isLoading={isLoading} />}
        <RadixDialog.Content
          onInteractOutside={(e) => isLoading && e.preventDefault()}
          className={clsx(
            "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "bg-white rounded-lg shadow-lg max-w-sm",
            "w-full inset-0 h-max box-content",
            large && "md:!max-w-[540px]",
            isLoading && "!pointer-events-none",
          )}
        >
          <div className="relative flex-auto w-full px-2.5">
            <H5 className="mt-4">{title}</H5>
            <p className="my-4 text-sm">{subTitle}</p>
            <div className={clsx("", className)}>{children}</div>
          </div>

          <div
            className={clsx(
              "grid grid-cols-2 p-2.5 gap-5",
              large && "!flex justify-end",
              buttonsClassNames,
            )}
          >
            {secondaryButton && (
              <RadixDialog.Close asChild>
                <div className={clsx(secondaryButton.block && "w-full block")}>
                  <Button
                    onClick={secondaryButton?.onClick}
                    className={clsx("!py-3 !px-8")}
                    type={secondaryButton.type}
                    block={secondaryButton.block}
                  >
                    {secondaryButton?.text}
                  </Button>
                </div>
              </RadixDialog.Close>
            )}

            {primaryButton && (
              <Button
                onClick={primaryButton.onClick}
                className={clsx("!py-3 !px-8")}
                type={primaryButton.type}
                id={primaryButton.id}
              >
                {primaryButton.text}
              </Button>
            )}
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
