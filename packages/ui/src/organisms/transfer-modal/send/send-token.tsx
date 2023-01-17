import clsx from "clsx"
import React, { useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"

import { DropdownSelect } from "../../../atoms/dropdown-select"
import { Button } from "../../../molecules/button"
import { InputDropdown } from "../../../molecules/input-dropdown"
import { Tooltip } from "../../../molecules/tooltip"
import { sumRules } from "../../../utils/validations"
import {
  SelectTokenMenu,
  TokenOption,
} from "../../select-token/select-token-menu"
import ArrowWhite from "../assets/arrowWhite.svg"
import { IWallet } from "../types"
import {
  makeAddressFieldValidation,
  validateTransferAmountField,
} from "./utils"

export interface ITransferToken {
  amount: string | number
  to: string
}

export type TokenConfig = {
  value: string
  icon: string
  fee: bigint
  toPresentation: (amount?: bigint) => number
}

interface ITransferModalSendToken {
  onSelectToken: (tokenValue: string) => void
  onSelectWallet: (walletId: string) => void
  onTokenSubmit: (values: ITransferToken) => void
  selectedToken: TokenOption
  selectedWalletId?: string
  tokenConfig: TokenConfig
  tokenOptions: TokenOption[]
  walletOptions: { label: string; value: string; afterLabel: string }[]
  wallets?: IWallet[]
}

export const TransferModalSendToken: React.FC<ITransferModalSendToken> = ({
  onSelectToken,
  onSelectWallet,
  onTokenSubmit,
  selectedToken,
  selectedWalletId,
  tokenConfig,
  tokenOptions,
  walletOptions,
  wallets,
}) => {
  const selectedWallet = useMemo(() => {
    if (!selectedWalletId) return
    return wallets?.find(
      (w) =>
        w.principal?.toText() === selectedWalletId ||
        w.address === selectedWalletId,
    )
  }, [selectedWalletId, wallets])

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
    if (!selectedWallet?.balance[selectedToken.value]) return

    const amount = selectedWallet.balance[selectedToken.value] - tokenConfig.fee
    if (amount < 0) {
      setValue("amount", "0")
      setError("amount", { message: "Insufficient funds" })
      setTimeout(() => {
        resetField("amount")
      }, 2000)
    } else setValue("amount", tokenConfig.toPresentation(amount))
  }, [
    selectedWallet?.balance,
    selectedToken.value,
    tokenConfig,
    setValue,
    setError,
    resetField,
  ])

  return (
    <>
      <div>
        <div className="text-xs text-black-base h-[142px]">
          <label htmlFor="amount">Amount to send</label>
          <div className="flex items-center mt-2.5">
            <input
              className={clsx(
                "min-w-0 text-4xl placeholder:text-black-base",
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
            <SelectTokenMenu
              tokenOptions={tokenOptions}
              selectedToken={selectedToken}
              onSelectToken={onSelectToken}
            />
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
            <p>
              Transfer fee: {tokenConfig.toPresentation(tokenConfig.fee)}{" "}
              {tokenConfig.value}
            </p>
            <div>
              <span>Balance: </span>
              <Tooltip tip="Click to select full balance">
                <span
                  className="border-b border-dotted cursor-pointer border-black-base text-black-base"
                  id="full-amount-button"
                  onClick={setFullAmount}
                >
                  {tokenConfig.toPresentation(
                    selectedWallet?.balance[selectedToken.value],
                  )}{" "}
                  {tokenConfig.value}
                </span>
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="mt-5 space-y-2 text-black-base">
          <DropdownSelect
            label="From"
            options={walletOptions ?? []}
            selectedValues={selectedWalletId ? [selectedWalletId] : []}
            setSelectedValues={([walletId]) => onSelectWallet(walletId)}
            isMultiselect={false}
          />
          <InputDropdown
            label="To"
            placeholder={
              selectedToken.tokenStandard === "ICP"
                ? "Recipient principal or account ID"
                : "Recipient principal"
            }
            options={
              walletOptions?.filter(
                (wallet) => wallet.value !== selectedWalletId,
              ) ?? []
            }
            errorText={errors.to?.message}
            registerFunction={register("to", {
              validate: makeAddressFieldValidation(
                selectedToken.tokenStandard === "ICP",
              ),
              required: "This field cannot be empty",
            })}
            setValue={(value) => setValue("to", value)}
          />
        </div>
      </div>
      <Button
        block
        className="flex items-center justify-center mt-auto"
        onClick={handleSubmit(onTokenSubmit)}
        id="send-token-button"
        icon={
          <img
            src={ArrowWhite}
            alt="ArrowWhite"
            className="w-[18px] h-[18px mr-[10px]"
          />
        }
      >
        Send
      </Button>
    </>
  )
}
