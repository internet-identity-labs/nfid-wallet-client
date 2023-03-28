import clsx from "clsx"
import { IconCmpArrowRight, IconCmpCancel } from "packages/ui/src/atoms/icons"
import { Image } from "packages/ui/src/atoms/image"
import { ChangeEvent } from "react"
import { UseFormRegisterReturn } from "react-hook-form"

import { IGroupOption } from "../types"

interface IInputTrigger {
  onShowModal: () => void
  onClearValue: () => void
  placeholder?: string
  setSelectedValue: (value: string) => void
  selectedOption?: IGroupOption
  errorText?: string
  registerFunction?: UseFormRegisterReturn<string>
}

export const InputTrigger = ({
  onShowModal,
  onClearValue,
  placeholder,
  setSelectedValue,
  selectedOption,
  errorText,
  registerFunction,
}: IInputTrigger) => {
  return (
    <>
      <div
        className={clsx(
          "border border-black rounded-md cursor-pointer h-14",
          "flex items-center justify-between",
          "text-black pl-4",
          errorText && "!border-red-600 ring ring-red-100",
        )}
      >
        {!selectedOption ? (
          <input
            id="input"
            className={clsx(
              "outline-none bg-transparent w-full h-11",
              "text-sm border-r border-r-gray-200",
            )}
            placeholder={placeholder}
            onChangeCapture={(e: ChangeEvent<HTMLInputElement>) =>
              setSelectedValue(e.target.value)
            }
            {...registerFunction}
          />
        ) : (
          <div className="flex">
            {selectedOption?.icon && (
              <Image
                src={selectedOption?.icon}
                alt={selectedOption?.value}
                className="mr-2.5"
              />
            )}
            <div className="leading-5">
              <p className="text-sm">{selectedOption?.title}</p>
              <p className="text-xs text-gray-400">
                {selectedOption?.subTitle}
              </p>
            </div>
          </div>
        )}
        <div
          className={clsx(
            "flex items-center justify-center",
            "w-12 hover:opacity-70",
          )}
          onClick={selectedOption ? onClearValue : onShowModal}
        >
          {selectedOption ? <IconCmpCancel /> : <IconCmpArrowRight />}
        </div>
      </div>
      <div className={clsx("absolute mt-[75px]", "text-xs py-1 text-red")}>
        {errorText}
      </div>
    </>
  )
}
