import BigNumber from "bignumber.js"
import clsx from "clsx"
import { Spinner } from "packages/ui/src/atoms/loader/spinner"
import { InputAmount } from "packages/ui/src/molecules/input-amount"
import {
  TickerAmount,
  formatAssetAmountRaw,
} from "packages/ui/src/molecules/ticker-amount"
import { BalanceFooter } from "packages/ui/src/organisms/send-receive/components/balance-footer"
import { Dispatch, FC, SetStateAction } from "react"
import {
  FieldErrorsImpl,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormResetField,
  UseFormSetValue,
} from "react-hook-form"
import { Id } from "react-toastify"

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

import { FT } from "frontend/integration/ft/ft"

export interface TransferFTUiProps {
  icpToken: FT
  tokens: FT[]
  token: FT
  validateAddress: (address: string) => boolean | string
  isLoading: boolean
  loadingMessage: string | undefined
  preselectedTransferDestination?: string
  tokenOptions: IGroupedOptions[] | undefined
  selectedTokenBlockchain: string
  sendReceiveTrackingFn: () => void
  isVault: boolean
  accountsOptions: IGroupedOptions[] | undefined
  optionGroups: IGroupedOptions[]
  selectedAccountAddress: string
  submit: (values: { amount: string; to: string }) => Promise<void | Id>
  setSelectedAccountAddress: Dispatch<SetStateAction<string>>
  amountInUSD: number
  setUSDAmount: (value: number) => void
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
  icpToken,
  tokens,
  token,
  validateAddress,
  isLoading,
  loadingMessage,
  preselectedTransferDestination,
  tokenOptions,
  selectedTokenBlockchain,
  sendReceiveTrackingFn,
  isVault,
  accountsOptions,
  optionGroups,
  selectedAccountAddress,
  submit,
  setSelectedAccountAddress,
  amountInUSD,
  setUSDAmount,
  register,
  errors,
  handleSubmit,
  setValue,
  resetField,
}) => {
  const maxHandler = () => {
    if (!token) return
    if (token.getTokenFee() && token.getTokenBalance()) {
      const balanceNum = new BigNumber(token.getTokenBalance().toString())
      const feeNum = new BigNumber(token.getTokenFee()!.toString())
      const val = balanceNum.minus(feeNum)

      if (val.isLessThanOrEqualTo(0)) return

      const formattedValue = formatAssetAmountRaw(
        Number(val),
        token.getTokenDecimals()!,
      )

      setValue("amount", formattedValue)
      setUSDAmount(Number(formattedValue))
    }
  }

  return (
    <BlurredLoader
      className="text-xs"
      overlayClassnames="rounded-xl"
      isLoading={isLoading}
      loadingMessage={loadingMessage}
    >
      <div className="flex justify-between">
        <p className="mb-1">Amount to send</p>
        <p
          onClick={maxHandler}
          className="text-xs font-bold cursor-pointer text-primaryButtonColor"
        >
          Max
        </p>
      </div>
      <div className="flex flex-col justify-between h-full pb-20">
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
                  Number(tokens[0].getTokenBalance()),
                  token.getTokenDecimals()!,
                ),
                formatAssetAmountRaw(
                  Number(token.getTokenFee()),
                  token.getTokenDecimals()!,
                ),
              ),
              valueAsNumber: true,
              //onBlur: calculateFee,
              onChange: (e) => {
                if (!rate) return
                setUSDAmount(Number(e.target.value))
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
          {!!rate && (
            <p
              className={clsx(
                "absolute mt-[75px] right-[20px]",
                "text-xs pt-[4px] text-gray-400",
              )}
            >
              <TickerAmount
                symbol={selectedTokenCurrency}
                value={amountInUSD}
                decimals={undefined}
                usdRate={rate}
              />
            </p>
          )}
          <ChooseModal
            optionGroups={tokenOptions ?? []}
            title="Asset to send"
            type="trigger"
            onSelect={(value) => {
              const arrayValue = value.split("&")
              if (arrayValue.length < 2) return

              resetField("amount")
              resetField("to")
              setUSDAmount(0)
              setSelectedCurrency(arrayValue[0])
              setSelectedBlockchain(arrayValue[1])
            }}
            onOpen={sendReceiveTrackingFn}
            preselectedValue={`${selectedTokenCurrency}&${selectedTokenBlockchain}`}
            isSmooth
            trigger={
              <div
                id={`token_${selectedTokenCurrency}`}
                className="flex items-center cursor-pointer shrink-0"
              >
                <ImageWithFallback
                  alt={tokens[0].getTokenName()}
                  fallbackSrc={IconNftPlaceholder}
                  src={`${tokens[0].getTokenLogo()}`}
                  className="w-[26px] mr-1.5"
                />
                <p className="text-lg font-semibold">{selectedTokenCurrency}</p>
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
            preselectedValue={selectedAccountAddress}
            onSelect={setSelectedAccountAddress}
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
          placeholder="Recipient wallet address or account ID"
          errorText={errors.to?.message}
          registerFunction={register("to", {
            required: "This field cannot be empty",
            validate: (value) => validateAddress(value),
            onBlur: calculateFee,
          })}
          onSelect={(value) => {
            resetField("to")
            setValue("to", value)
            calculateFee()
          }}
          preselectedValue={preselectedTransferDestination}
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
                  <TickerAmount
                    value={Number(transferFee)}
                    decimals={decimals}
                    symbol={selectedTokenCurrency}
                  />
                  {!!rate && (
                    <span className="block mt-1 text-xs">
                      <TickerAmount
                        value={Number(transferFee)}
                        decimals={decimals}
                        symbol={selectedTokenCurrency}
                        usdRate={rate}
                      />
                    </span>
                  )}
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
        <BalanceFooter
          token={icpToken}
          selectedAccountAddress={selectedAccountAddress}
          hasUsdBalance={true}
        />
      </div>
    </BlurredLoader>
  )
}
