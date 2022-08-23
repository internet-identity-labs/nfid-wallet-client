import { Principal } from "@dfinity/principal"
import clsx from "clsx"
import React, { useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"

import Logo from "frontend/assets/dfinity.svg"
import { Button } from "frontend/ui/atoms/button"
import { isHex } from "frontend/ui/utils"
import { sumRules } from "frontend/ui/utils/validations"

import ArrowWhite from "./assets/arrowWhite.svg"

import TransactionSuccess from "./sucess"

interface ISendForm {
  address: string
  sum: string
}

export interface ITransactionSendForm {
  errorString?: string
  onSendTransaction: SubmitHandler<ISendForm>
  isSuccess?: boolean
  onClose: () => void
  balance: string | number
}

const rowStyles = "flex py-2 border-b border-gray-200"

const TransactionSendForm: React.FC<ITransactionSendForm> = ({
  errorString,
  onSendTransaction,
  isSuccess,
  onClose,
  balance,
}) => {
  const [sumLength, setSumLength] = useState(0)
  const {
    register,
    formState: { errors, dirtyFields },
    getValues,
    handleSubmit,
    setError,
    setValue,
  } = useForm<ISendForm>()

  React.useEffect(() => {
    if (errorString) {
      setError("address", {
        type: "manual",
        message: errorString,
      })
    }
  }, [errorString, setError, setValue])

  const onAddressChange = (e: any) => {
    const value = e.target.value

    if (isHex(value))
      return setError("address", { type: "manual", message: "" })
    try {
      if (!!Principal.fromText(value))
        setError("address", { type: "manual", message: "" })
    } catch {
      setError("address", {
        type: "manual",
        message: "This is not a valid account identifier",
      })
    }
  }

  const isFormComplete =
    !!dirtyFields.address && !errors.address && !!dirtyFields.sum && !errors.sum

  if (isSuccess)
    return <TransactionSuccess sum={getValues().sum} onClose={onClose} />

  return (
    <div>
      <div className="grid grid-cols-2 mt-14">
        <input
          className={clsx(
            "text-black-base placeholder:text-gray-400 text-4xl",
            "p-0 border-none outline-none resize-none focus:ring-0",
            "text-right block mr-2",
          )}
          autoFocus
          placeholder="0"
          type="number"
          id="input"
          onKeyUp={(e) => setSumLength(e.target.value.length)}
          {...register("sum", {
            valueAsNumber: true,
            required: sumRules.errorMessages.required,
          })}
        />

        <label
          htmlFor="input"
          className={clsx(
            "text-4xl text-gray-400",
            sumLength > 0 && "text-black-base",
          )}
        >
          ICP
        </label>
      </div>
      <p className="mt-5 text-xs text-center ">
        {Number(balance) === 0
          ? "You don't have any ICP to send."
          : `Transfer fee: 0.0001 ICP`}
      </p>
      <form>
        <div
          className={clsx(
            "rounded-md border border-gray-200 mb-5 mt-7",
            "text-sm",
          )}
        >
          <div className={clsx(rowStyles, "items-center")}>
            <p className="w-24 pl-5 ">Token</p>
            <img src={Logo} alt="" className={clsx("w-6 h-6")} />
            <p className="ml-2 text-black-base">ICP</p>
          </div>
          <div className={clsx(rowStyles, "items-start")}>
            <p className="w-24 pl-5 ">To</p>
            <div>
              <textarea
                className={clsx(
                  "p-0 border-none shadow-none outline-none resize-none focus:ring-0",
                  "text-black-base placeholder:text-gray-400 text-sm w-[220px]",
                )}
                rows={3}
                placeholder="Principal or account ID"
                {...register("address", {
                  required: "Principal or account ID is required",
                })}
                onChange={onAddressChange}
              />
              <div
                className={clsx(
                  "text-sm py-1 text-gray-400",
                  errors.address?.message && "!text-red-base",
                )}
              >
                {errors.address?.message ?? ""}
              </div>
            </div>
          </div>
          <div className="flex h-[90px] py-2">
            <p className="w-24 pl-5">Note</p>
            <textarea
              className={clsx(
                "p-0 border-none shadow-none outline-none resize-none focus:ring-0",
                "text-black-base placeholder:text-gray-400 text-sm",
              )}
              placeholder="Optional message"
            />
          </div>
        </div>
        <Button
          block
          primary
          disabled={!isFormComplete}
          className="flex items-center justify-center"
          onClick={handleSubmit(onSendTransaction)}
        >
          <img
            src={ArrowWhite}
            alt="ArrowWhite"
            className="w-[18px] h-[18px mr-[10px]"
          />
          Send
        </Button>
      </form>
    </div>
  )
}

export default TransactionSendForm
