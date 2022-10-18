import clsx from "clsx"
import { useAtom } from "jotai"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import ReactTooltip from "react-tooltip"

import { transferModalAtom } from "frontend/apps/identity-manager/profile/transfer-modal/state"
import ICPIcon from "frontend/assets/dfinity.svg"
import { walletFee } from "frontend/constants/wallet"
import { IWallet } from "frontend/integration/identity-manager/wallet/types"
import { Button } from "frontend/ui/atoms/button"
import { DropdownSelect } from "frontend/ui/atoms/dropdown-select"
import { InputDropdown } from "frontend/ui/molecules/input-dropdown"
import { sumRules } from "frontend/ui/utils/validations"

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
      afterLabel: wallet.balance?.value,
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
    getValues,
  } = useForm<ITransferToken>({
    defaultValues: {
      to: "",
    },
  })

  const setFullAmount = useCallback(() => {
    setValue(
      "amount",
      (Number(currentWallet?.balance?.value) - walletFee).toString(),
    )
  }, [currentWallet, setValue])

  return (
    <div className="flex flex-col justify-between flex-grow">
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
              <img src={ICPIcon} alt="icp" className="w-6" />
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
              <span
                data-tip="Click to select full balance"
                className="border-b border-dotted cursor-pointer border-black-base text-black-base"
                id="full-amount-button"
                onClick={setFullAmount}
              >
                {currentWallet?.balance?.value}
              </span>
            </div>
          </div>
          <ReactTooltip className="w-52" backgroundColor="#000" />
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
            options={walletsOptions ?? []}
            errorText={errors.to?.message}
            registerFunction={register("to", {
              validate: validateAddressField,
              required: "This field cannot be empty",
            })}
            value={() => getValues("to")}
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
        Send
      </Button>
    </div>
  )
}
