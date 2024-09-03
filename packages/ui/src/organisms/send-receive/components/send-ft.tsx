import BigNumber from "bignumber.js"
import clsx from "clsx"
import { Spinner } from "packages/ui/src/atoms/loader/spinner"
import { InputAmount } from "packages/ui/src/molecules/input-amount"
import { formatAssetAmountRaw } from "packages/ui/src/molecules/ticker-amount"
import { BalanceFooter } from "packages/ui/src/organisms/send-receive/components/balance-footer"
import { Dispatch, FC, SetStateAction, useCallback, useState } from "react"
import {
  FieldErrorsImpl,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormResetField,
  UseFormSetValue,
} from "react-hook-form"
import { Id } from "react-toastify"
import useSWR from "swr"

import {
  Button,
  ChooseModal,
  IconCmpArrow,
  IconCmpArrowRight,
  Label,
  BlurredLoader,
  sumRules,
  IGroupedOptions,
  ImageWithFallback,
  IconNftPlaceholder,
} from "@nfid-frontend/ui"
import { validateTransferAmountField } from "@nfid-frontend/utils"
import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"

import { FT } from "frontend/integration/ft/ft"

export interface TransferFTUiProps {
  publicKey: string
  tokens: FT[]
  token: FT | undefined
  setChosenToken: (value: string) => void
  validateAddress: (address: string) => boolean | string
  isLoading: boolean
  loadingMessage: string | undefined
  sendReceiveTrackingFn: () => void
  isVault: boolean
  accountsOptions: IGroupedOptions[] | undefined
  optionGroups: IGroupedOptions[]
  selectedVaultsAccountAddress: string
  submit: (values: { amount: string; to: string }) => Promise<void | Id>
  setSelectedVaultsAccountAddress: Dispatch<SetStateAction<string>>
  register: UseFormRegister<{
    amount: string
    to: string
  }>
  errors: Partial<
    FieldErrorsImpl<{
      amount: string
      to: string
    }>
  >
  handleSubmit: UseFormHandleSubmit<{
    amount: string
    to: string
  }>
  setValue: UseFormSetValue<{
    amount: string
    to: string
  }>
  resetField: UseFormResetField<{
    amount: string
    to: string
  }>
}

export const TransferFTUi: FC<TransferFTUiProps> = ({
  publicKey,
  tokens,
  token,
  setChosenToken,
  validateAddress,
  isLoading,
  loadingMessage,
  sendReceiveTrackingFn,
  isVault,
  accountsOptions,
  optionGroups,
  selectedVaultsAccountAddress,
  submit,
  setSelectedVaultsAccountAddress,
  register,
  errors,
  handleSubmit,
  setValue,
  resetField,
}) => {
  const [amountInUSD, setAmountInUSD] = useState(0)

  const { data: tokenFeeUsd, isLoading: isFeeLoading } = useSWR(
    token ? ["tokenFee", token.getTokenAddress()] : null,
    token ? () => token.getTokenFeeFormattedUsd() : null,
  )

  const { data: usdRate } = useSWR(
    token ? ["tokenRate", token.getTokenAddress(), amountInUSD] : null,
    ([_, __, amount]) => token?.getTokenRateFormatted(amount.toString()),
  )

  const getTokenOptions = useCallback(() => {
    const options = tokens.map((token) => {
      return {
        label: "Internet Computer",
        options: [
          {
            icon: token.getTokenLogo(),
            value: token.getTokenAddress(),
            title: token.getTokenSymbol(),
            subTitle: token.getTokenName(),
          },
        ],
      }
    })
    return options
  }, [tokens])

  const maxHandler = async () => {
    if (!token) return
    const fee = token.getTokenFee()
    if (fee && token.getTokenBalance()) {
      const balanceNum = new BigNumber(token.getTokenBalance()!.toString())
      const feeNum = new BigNumber(fee.toString())
      const val = balanceNum.minus(feeNum)
      if (val.isLessThanOrEqualTo(0)) return

      const formattedValue = formatAssetAmountRaw(
        Number(val),
        token.getTokenDecimals()!,
      )

      setValue("amount", formattedValue)
      setAmountInUSD(Number(formattedValue))
    }
  }

  if (!token || isLoading)
    return (
      <BlurredLoader
        isLoading
        loadingMessage={loadingMessage}
        overlayClassnames="rounded-xl"
        className="text-xs"
      />
    )

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="mb-1 text-xs">Amount to send</p>
        <p
          onClick={maxHandler}
          className="text-xs font-bold cursor-pointer text-primaryButtonColor"
        >
          Max
        </p>
      </div>
      <div className="flex flex-col justify-between h-full pb-[50px]">
        <div
          className={clsx(
            "border rounded-[12px] flex items-center justify-between pl-4 pr-5 h-14 mb-4",
            errors.amount ? "ring border-red-600 ring-red-100" : "border-black",
          )}
        >
          <InputAmount
            decimals={token.getTokenDecimals()!}
            {...register("amount", {
              required: sumRules.errorMessages.required,
              validate: validateTransferAmountField(
                formatAssetAmountRaw(
                  Number(token.getTokenBalance()),
                  token.getTokenDecimals()!,
                ),
                formatAssetAmountRaw(
                  Number(token.getTokenFee()),
                  token.getTokenDecimals()!,
                ),
              ),
              valueAsNumber: true,
              onChange: (e) => {
                setAmountInUSD(Number(e.target.value))
              },
            })}
          />
          <div
            className={clsx(
              "absolute mt-[75px] left-5",
              "text-xs py-1 text-red",
            )}
          >
            {errors.amount?.message}
          </div>
          <p
            className={clsx(
              "absolute mt-[75px] right-[20px]",
              "text-xs pt-[4px] text-gray-400",
            )}
          >
            {usdRate}
          </p>
          <ChooseModal
            optionGroups={getTokenOptions()}
            title="Asset to send"
            type="trigger"
            onSelect={(value) => {
              console.log("vallue", value)
              resetField("amount")
              resetField("to")
              setAmountInUSD(0)
              setChosenToken(value)
            }}
            preselectedValue={token.getTokenAddress()}
            onOpen={sendReceiveTrackingFn}
            isSmooth
            trigger={
              <div
                id={`token_${token.getTokenName()}_${token.getTokenAddress()}`}
                className="flex items-center cursor-pointer shrink-0"
              >
                <ImageWithFallback
                  alt={token.getTokenName()}
                  fallbackSrc={IconNftPlaceholder}
                  src={`${token.getTokenLogo()}`}
                  className="w-[26px] mr-1.5"
                />
                <p className="text-lg font-semibold">
                  {token.getTokenSymbol()}
                </p>
                <IconCmpArrowRight className="ml-4" />
              </div>
            }
          />
        </div>
        {isVault && (
          <ChooseModal
            label="From"
            title="From"
            optionGroups={accountsOptions ?? []}
            preselectedValue={selectedVaultsAccountAddress}
            onSelect={setSelectedVaultsAccountAddress}
            warningText={
              isVault ? undefined : (
                <div className="w-[337px]">
                  Starting September 1, 2023, assets from external applications
                  will not be displayed in NFID. <br /> <br /> To manage those
                  assets in NFID, transfer them to your NFID Wallet. Otherwise,
                  you’ll only have access through the application’s website.
                </div>
              )
            }
          />
        )}
        <ChooseModal
          type="input"
          label="To"
          title={"Choose an account"}
          optionGroups={optionGroups}
          isFirstPreselected={false}
          placeholder={
            token.getTokenAddress() === ICP_CANISTER_ID
              ? "Recipient wallet address or account ID"
              : "Recipient wallet address"
          }
          errorText={errors.to?.message}
          registerFunction={register("to", {
            required: "This field cannot be empty",
            validate: (value) => validateAddress(value),
          })}
          onSelect={(value) => {
            resetField("to")
            setValue("to", value)
          }}
        />
        <div>
          <Label className="text-secondary">Network fee</Label>
          <div
            className={clsx(
              "flex items-center justify-between mt-1",
              "px-2.5 text-gray-400 bg-gray-100 rounded-[12px] h-14",
            )}
          >
            <div>
              <p className="text-sm">Instant</p>
            </div>
            {isFeeLoading ? (
              <Spinner className="w-3 h-3 text-gray-400" />
            ) : (
              <div className="text-right">
                <p className="text-sm leading-5" id="fee">
                  {token.getTokenFeeFormatted()}
                  <span className="block mt-1 text-xs">{tokenFeeUsd}</span>
                </p>
              </div>
            )}
          </div>
        </div>
        <Button
          className="mt-auto text-base"
          type="primary"
          id={"sendFT"}
          block
          onClick={handleSubmit(submit)}
          icon={<IconCmpArrow className="rotate-[135deg]" />}
        >
          Send
        </Button>
        <BalanceFooter token={token} publicKey={publicKey} />
      </div>
    </>
  )
}
