import * as RadixDialog from "@radix-ui/react-dialog"
import clsx from "clsx"
import { motion, AnimatePresence } from "framer-motion"
import React, { useState, useEffect } from "react"

import { CloseIcon } from "../../atoms/icons/close-button"
import { Loader } from "../../atoms/loader"
import { H5 } from "../../atoms/typography"
import { Button } from "../button"
import { useDisableScroll } from "./hooks/disable-scroll"

export interface ModalButtonProps {
  text: string
  onClick?: () => void
  type?: "primary" | "secondary" | "red" | "stroke"
  block?: boolean
  id?: string
}

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  isVisible?: boolean
  onClose?: () => void

  title?: string
  subTitle?: string | JSX.Element
  primaryButton?: ModalButtonProps
  secondaryButton?: ModalButtonProps

  isModalOpen?: boolean
  isModalOpenChange?: (open: boolean) => void

  trigger?: JSX.Element
  isLoading?: boolean
  large?: boolean
  buttonsClassNames?: string
  backgroundClassnames?: string
  showCloseButton?: boolean
  useFramerMotion?: boolean
  disableScroll?: boolean
}

export const Modal: React.FC<ModalProps> = ({
  children,
  className,
  isVisible,
  onClose,
  title,
  subTitle,
  primaryButton,
  secondaryButton,
  isModalOpen: controlledOpen,
  isModalOpenChange,
  trigger,
  isLoading = false,
  large,
  buttonsClassNames,
  backgroundClassnames,
  showCloseButton,
  useFramerMotion = false,
  disableScroll = true,
  style,
}) => {
  const [internalOpen, setInternalOpen] = useState(isVisible ?? false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : (isVisible ?? internalOpen)
  const isAdvanced = !!(title || primaryButton || secondaryButton || trigger)
  useDisableScroll(!isAdvanced && disableScroll && isOpen)
  useEffect(() => {
    if (!isControlled && isVisible !== undefined) {
      setInternalOpen(isVisible)
    }
  }, [isVisible, isControlled])

  const handleOpenChange = (open: boolean) => {
    if (isControlled) {
      isModalOpenChange?.(open)
    } else {
      setInternalOpen(open)
      if (!open && onClose) {
        onClose()
      }
    }
  }

  const handleClose = () => {
    handleOpenChange(false)
  }

  const shouldShowCloseButton =
    showCloseButton !== undefined
      ? showCloseButton
      : isAdvanced && (onClose || isModalOpenChange)

  if (!isAdvanced || useFramerMotion) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="modal-overlay"
            className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-screen bg-opacity-80 bg-[#18181B]"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div
              className={clsx(
                "rounded-[24px] min-w-min min-h-min h-min bg-white dark:bg-darkGray",
                className,
              )}
              onClick={(e) => e.stopPropagation()}
              style={style}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <RadixDialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>}
      <RadixDialog.Portal>
        <RadixDialog.Overlay
          className={clsx(
            "fixed inset-0 bg-black",
            backgroundClassnames || "bg-opacity-40",
          )}
        />
        {isLoading && <Loader isLoading={isLoading} />}
        <RadixDialog.Content
          onInteractOutside={(e) => {
            if (isLoading) {
              e.preventDefault()
            }
          }}
          onEscapeKeyDown={(e) => {
            if (isLoading) {
              e.preventDefault()
            }
          }}
          className={clsx(
            "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "bg-white rounded-[24px] shadow-lg",
            "w-full inset-0 h-max box-content",
            large ? "max-w-sm md:max-w-lg" : "max-w-sm",
            isLoading && "!pointer-events-none",
            className,
          )}
          style={style}
        >
          {/* Close button */}
          {shouldShowCloseButton && (
            <RadixDialog.Close asChild>
              <div
                className={clsx("absolute top-5 right-5 cursor-pointer z-10")}
                onClick={handleClose}
              >
                <CloseIcon />
              </div>
            </RadixDialog.Close>
          )}

          {/* Advanced modal content */}
          <div
            className={clsx(
              "relative flex-auto w-full",
              large ? "px-6" : "px-2.5",
            )}
          >
            {title && <H5 className="mt-4">{title}</H5>}
            {subTitle && <p className="my-4 text-sm">{subTitle}</p>}
            <div className={clsx("", className)}>{children}</div>
          </div>

          {(primaryButton || secondaryButton) && (
            <div
              className={clsx(
                large
                  ? "grid grid-cols-2 p-6 gap-4"
                  : "grid grid-cols-2 p-2.5 gap-5",
                large && "!flex justify-end",
                buttonsClassNames,
              )}
            >
              {secondaryButton && (
                <RadixDialog.Close asChild>
                  <div
                    className={clsx(secondaryButton.block && "w-full block")}
                  >
                    <Button
                      onClick={secondaryButton?.onClick}
                      className={clsx("!py-3 !px-8")}
                      type={secondaryButton.type || "stroke"}
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
                  type={primaryButton.type || "primary"}
                  id={primaryButton.id}
                  block={primaryButton.block}
                >
                  {primaryButton.text}
                </Button>
              )}
            </div>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}

export const ModalComponent = Modal
