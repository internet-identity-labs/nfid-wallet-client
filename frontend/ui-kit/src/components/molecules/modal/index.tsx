import React from "react"
import clsx from "clsx"
import { H5 } from "src/components/atoms/typography"
import { P } from "src/components/atoms/typography/paragraph"
import { Button } from "src/components/atoms/button"
import { ModalSuccessIcon } from "./successIcon"
import { ModalCloseIcon } from "./closeIcon"

interface ModalProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  buttonText: string
  title: string
  description?: string
  onClick?: () => void
}

export const Modal: React.FC<ModalProps> = ({
  children,
  className,
  title,
  buttonText,
  description,
  onClick,
}) => {
  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none mx-4">
        <div className="relative w-full my-6 mx-auto max-w-sm">
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            <div className="relative flex-auto text-center">
              <ModalSuccessIcon className="mx-auto" />

              <H5 className="my-4">{title}</H5>

              <P className="mb-6">{description}</P>
            </div>

            <div className="flex items-center justify-end p-6">
              <Button filled className="w-full" onClick={onClick}>
                {buttonText}
              </Button>
            </div>
          </div>

          <div className="absolute top-5 right-5" onClick={onClick}>
            <ModalCloseIcon />
          </div>
        </div>
      </div>
      <div className="opacity-5 fixed inset-0 z-40 bg-black-base"></div>
    </>
  )
}
