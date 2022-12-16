import clsx from "clsx"
import { useAtom } from "jotai"
import { InputDropdown } from "packages/ui/src/molecules/input-dropdown"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"

import { toPresentation } from "@nfid/integration/token/icp"

import { transferModalAtom } from "frontend/apps/identity-manager/profile/transfer-modal/state"
import { walletFee, walletFeeE8s } from "frontend/constants/wallet"
import { Button } from "frontend/ui/atoms/button"
import { sumRules } from "frontend/ui/utils/validations"

import { DropdownSelect } from "../../../atoms/dropdown-select"
import { IconSvgDfinity } from "../../../atoms/icons"
import { Tooltip } from "../../../molecules/tooltip"
import ArrowWhite from "../assets/arrowWhite.svg"
import { IWallet } from "../types"
import { validateAddressField, validateTransferAmountField } from "./utils"

export interface ITransferToken {
  amount: string | number
  to: string
}

interface ITransferModalSendToken {
  onTokenSubmit: (values: ITransferToken) => void
  wallets?: IWallet[]
}

export const TransferModalSendToken: React.FC<ITransferModalSendToken> = ({
  onTokenSubmit,
  wallets,
}) => {
  const [transferModalState, setTransferModalState] = useAtom(transferModalAtom)

  const [selectedWallets, setSelectedWallets] = useState<string[]>([])

  const currentWallet = useMemo(() => {
    if (!selectedWallets.length) return
    return wallets?.find((w) => w.principal?.toText() === selectedWallets[0])
  }, [selectedWallets, wallets])

  const walletsOptions = useMemo(() => {
    return wallets?.map((wallet) => ({
      label: wallet.label ?? "",
      value: wallet.principal?.toText() ?? "",
      afterLabel: `${toPresentation(wallet.balance)} ICP`,
    }))
  }, [wallets])

  useEffect(() => {
    if (currentWallet)
      setTransferModalState({
        ...transferModalState,
        selectedWallet: currentWallet,
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWallet])

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    setError,
    resetField,
  } = useForm<ITransferToken>({
    defaultValues: {
      to: "",
    },
  })

  const setFullAmount = useCallback(() => {
    if (!currentWallet?.balance) return
    const amount = currentWallet.balance - BigInt(walletFeeE8s)
    if (amount < 0) {
      setValue("amount", "0")
      setError("amount", { message: "Insufficient funds" })
      setTimeout(() => {
        resetField("amount")
      }, 2000)
    } else setValue("amount", toPresentation(amount))
  }, [currentWallet?.balance, resetField, setError, setValue])

  return (
    <>
      <div>
        <div className="text-xs text-black-base h-[142px]">
          <label htmlFor="amount">Amount to send</label>
          <div className="flex items-center justify-between mt-2.5">
            <input
              className={clsx(
                "w-full text-4xl placeholder:text-black-base",
                "outline-none border-none h-[66px] focus:ring-0",
                "p-0",
              )}
              placeholder="0.00"
              type="number"
              id="amount"
              min={0}
              {...register("amount", {
                required: sumRules.errorMessages.required,
                validate: validateTransferAmountField,
              })}
            />
            <div
              className={clsx(
                "flex items-center space-x-2 shrink-0",
                "text-sm font-semibold",
              )}
            >
              <img src={IconSvgDfinity} alt="icp" className="w-6" />
              <span>ICP</span>
            </div>
          </div>
          <span className={clsx("absolute text-red-600")}>
            {errors.amount?.message}
          </span>
          <div
            className={clsx(
              "w-full h-[1px] bg-black-base rounded-md mt-5",
              errors.amount && "bg-red-600",
            )}
          />
          <div className="flex items-center justify-between mt-2 text-gray-400">
            <p>Transfer fee: {walletFee} ICP</p>
            <div>
              <span>Balance: </span>
              <Tooltip tip="Click to select full balance">
                <span
                  className="border-b border-dotted cursor-pointer border-black-base text-black-base"
                  id="full-amount-button"
                  onClick={setFullAmount}
                >
                  {toPresentation(currentWallet?.balance)} {"ICP"}
                </span>
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="mt-5 space-y-2 text-black-base">
          <DropdownSelect
            label="From"
            options={walletsOptions ?? []}
            selectedValues={selectedWallets}
            setSelectedValues={setSelectedWallets}
            isMultiselect={false}
            firstSelected
          />
          <InputDropdown
            label="To"
            placeholder="Recipient principal or account ID"
            options={
              walletsOptions?.filter(
                (wallet) => wallet.value !== selectedWallets[0],
              ) ?? []
            }
            errorText={errors.to?.message}
            registerFunction={register("to", {
              validate: validateAddressField,
              required: "This field cannot be empty",
            })}
            setValue={(value) => setValue("to", value)}
          />
        </div>
      </div>
      <Button
        block
        primary
        className="flex items-center justify-center mt-auto"
        onClick={handleSubmit(onTokenSubmit)}
        id="send-token-button"
      >
        <img
          src={ArrowWhite}
          alt="ArrowWhite"
          className="w-[18px] h-[18px mr-[10px]"
        />
        Send
      </Button>
    </>
  )
}
