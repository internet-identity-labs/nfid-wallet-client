import BigNumber from "bignumber.js"
import clsx from "clsx"
import { Spinner } from "packages/ui/src/atoms/loader/spinner"
import { InputAmount } from "packages/ui/src/molecules/input-amount"
import { formatAssetAmountRaw } from "packages/ui/src/molecules/ticker-amount"
import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react"
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
  BlurredLoader,
  sumRules,
  IGroupedOptions,
  ImageWithFallback,
  IconNftPlaceholder,
} from "@nfid-frontend/ui"
import { validateTransferAmountField } from "@nfid-frontend/utils"
import { E8S, ICP_CANISTER_ID } from "@nfid/integration/token/constants"

import { AccountBalance } from "frontend/features/fungible-token/fetch-balances"
import { FT } from "frontend/integration/ft/ft"

export interface TransferFTUiProps {
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
  vaultsBalance?: AccountBalance | undefined
  setUsdAmount: (v: number) => void
}

export const TransferFTUi: FC<TransferFTUiProps> = ({
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
  vaultsBalance,
  setUsdAmount,
}) => {
  const [amountInUSD, setAmountInUSD] = useState(0)
  const [tokenOptions, setTokenOptions] = useState<IGroupedOptions[]>([])

  const { data: tokenFeeUsd, isLoading: isFeeLoading } = useSWR(
    token ? ["tokenFee", token.getTokenAddress()] : null,
    token ? () => token.getTokenFeeFormattedUsd() : null,
  )

  const { data: usdRate } = useSWR(
    token ? ["tokenRate", token.getTokenAddress(), amountInUSD] : null,
    ([_, __, amount]) => token?.getTokenRateFormatted(amount.toString()),
  )

  const getTokenOptions = useCallback(async () => {
    const options = await Promise.all(
      tokens.map(async (token) => {
        const usdBalance = await token.getTokenRate(
          token.getTokenBalanceFormatted() || "0",
        )
        console.log("balll", usdBalance)
        return {
          label: "Internet Computer",
          options: [
            {
              icon: token.getTokenLogo(),
              value: token.getTokenAddress(),
              title: token.getTokenSymbol(),
              subTitle: token.getTokenName(),
              innerTitle: `${
                token.getTokenBalanceFormatted() || 0
              } ${token.getTokenSymbol()}`,
              innerSubtitle:
                usdBalance === undefined
                  ? "Not listed"
                  : usdBalance === 0
                  ? "0.00 USD"
                  : `${usdBalance.toString()} USD`,
            },
          ],
        }
      }),
    )

    return isVault
      ? options.filter((option) => option.options[0].value === ICP_CANISTER_ID)
      : options
  }, [tokens, isVault])

  useEffect(() => {
    getTokenOptions().then(setTokenOptions)
  }, [getTokenOptions])

  useEffect(() => {
    setUsdAmount(amountInUSD)
  }, [amountInUSD])

  const maxHandler = async () => {
    if (!token) return
    const fee = token.getTokenFee()
    if (fee && token.getTokenBalance()) {
      const balanceNum =
        isVault && vaultsBalance
          ? new BigNumber(vaultsBalance.balance["ICP"].toString())
          : new BigNumber(token.getTokenBalance()!.toString())
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
      <p className="mb-1 text-xs">Amount to send</p>
      <div
        className={clsx(
          "border rounded-[12px] p-4 h-[100px]",
          errors.amount ? "ring border-red-600 ring-red-100" : "border-black",
        )}
      >
        <div className="flex items-center justify-between">
          <InputAmount
            decimals={token.getTokenDecimals()!}
            {...register("amount", {
              required: sumRules.errorMessages.required,
              validate: validateTransferAmountField(
                formatAssetAmountRaw(
                  isVault && vaultsBalance
                    ? Number(vaultsBalance.balance["ICP"])
                    : Number(token.getTokenBalance()),
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
          <div className="p-[6px] bg-[#D1D5DB]/40 rounded-[24px] inline-block">
            <ChooseModal
              optionGroups={tokenOptions}
              title="Token to send"
              type="trigger"
              onSelect={(value) => {
                resetField("amount")
                resetField("to")
                setAmountInUSD(0)
                setChosenToken(value)
              }}
              preselectedValue={token.getTokenAddress()}
              onOpen={sendReceiveTrackingFn}
              isSmooth
              iconClassnames="object-cover h-full rounded-full"
              trigger={
                <div
                  id={`token_${token.getTokenName()}_${token.getTokenAddress()}`}
                  className="flex items-center cursor-pointer shrink-0"
                >
                  <ImageWithFallback
                    alt={token.getTokenName()}
                    fallbackSrc={IconNftPlaceholder}
                    src={`${token.getTokenLogo()}`}
                    className="w-[28px] mr-1.5 rounded-full"
                  />
                  <p className="text-lg font-semibold">
                    {token.getTokenSymbol()}
                  </p>
                  <IconCmpArrowRight className="ml-4" />
                </div>
              }
            />
          </div>
        </div>
        <div className="flex items-center justify-between text-right">
          <p className={clsx("text-xs mt-2 text-gray-500 leading-5")}>
            {usdRate}
          </p>
          <div className="mt-2 text-xs leading-5 text-right text-gray-500">
            Balance:&nbsp;
            <span className="cursor-pointer" onClick={maxHandler}>
              {!isVault ? (
                <span className="text-teal-600">
                  {token.getTokenBalanceFormatted() || "0"}&nbsp;
                  {token.getTokenSymbol()}
                </span>
              ) : (
                <span className="text-teal-600">
                  {Number(vaultsBalance?.balance["ICP"]) / E8S} ICP
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
      <div className="h-4 mt-1 text-xs leading-4 text-red-600">
        {errors.amount?.message}
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
      <div className="flex justify-between">
        <div className="text-xs text-gray-500">Network fee</div>
        <div>
          {isFeeLoading ? (
            <Spinner className="w-3 h-3 text-gray-400" />
          ) : (
            <div className="text-right">
              <p className="text-xs leading-5 text-gray-600" id="fee">
                <span>{token.getTokenFeeFormatted()}</span>
                <span className="block mt-1 text-xs">{tokenFeeUsd}</span>
              </p>
            </div>
          )}
        </div>
      </div>
      <Button
        className={clsx(
          "h-[48px] absolute bottom-5 left-5 right-5 !w-auto",
          isVault ? "mt-2" : "mt-auto",
        )}
        type="primary"
        id="sendFT"
        block
        onClick={handleSubmit(submit)}
        icon={<IconCmpArrow className="rotate-[135deg]" />}
      >
        Send
      </Button>
    </>
  )
}
