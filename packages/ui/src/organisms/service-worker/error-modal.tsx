import * as Dialog from "@radix-ui/react-dialog"
import clsx from "clsx"
import React from "react"

export type ErrorMessage = {
  message: string
  status: number
  url?: string
}

type ErrorModalProps = {
  errorMessages: ErrorMessage[]
}

export const ErrorModal: React.FC<ErrorModalProps> = ({ errorMessages }) => {
  console.debug("ErrorModal", { shouldOpen: errorMessages.length > 0 })
  return (
    <Dialog.Root open={errorMessages.length > 0}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={clsx(
            "bg-gray-100/80 fixed w-full h-full inset-0 animate-fade-in",
          )}
        />
        <Dialog.Content
          className={clsx(
            "bg-white fixed border rounded-lg shadow-lg",
            "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-[90vw] max-w-2xl max-h-96",
            "p-4",
            "focus:outline-none",
            "animate-snuggle-up",
          )}
          style={{
            animation: "snuggle-up 150ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <Dialog.Title className={clsx("m-0 font-bold text-lg")}>
            Response verification error
          </Dialog.Title>
          <Dialog.Description
            className={clsx("mt-2 text-base leading-relaxed")}
          >
            <div className={clsx("flex flex-col overflow-scroll")}>
              {errorMessages.map(({ url, message }) => (
                <div key={url} className={clsx("flex flex-col")}>
                  <div className={clsx("font-bold")}>url: {url}</div>
                  <div className={clsx("font-bold")}>message: {message}</div>
                </div>
              ))}
            </div>
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
