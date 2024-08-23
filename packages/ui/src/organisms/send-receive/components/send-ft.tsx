import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"
import clsx from "clsx"
import { FungibleAsset } from "packages/integration/src/lib/asset/types"
import { NoIcon } from "packages/ui/src/assets/no-icon"
import { Spinner } from "packages/ui/src/atoms/loader/spinner"
import { InputAmount } from "packages/ui/src/molecules/input-amount"
import {
  TickerAmount,
  formatAssetAmountRaw,
} from "packages/ui/src/molecules/ticker-amount"
import { BalanceFooter } from "packages/ui/src/organisms/send-receive/components/balance-footer"
import { Dispatch, FC, SetStateAction } from "react"
import { useForm } from "react-hook-form"
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
} from "@nfid-frontend/ui"
import { validateTransferAmountField } from "@nfid-frontend/utils"

import { ITransferFTConnector } from "frontend/ui/connnector/transfer-modal/types"
import { Blockchain } from "frontend/ui/connnector/types"

enum TransferModalType {
  FT = "ft",
  FT20 = "ft20",
  NFT = "nft",
}
enum TokenStandards {
  "ICP" = "ICP",
  "ICRC1" = "ICRC1",
}

enum NativeToken {
  ICP = "ICP",
}

export interface TransferFTUiProps {
  isLoading: boolean
  isBalanceLoading: boolean
  isFeeLoading: boolean
  loadingMessage: string | undefined
  balance: bigint | number | undefined
  rate: number | undefined
  decimals: number | undefined
  transferFee: bigint | number | undefined
  calculateFee: () => void
  selectedTokenCurrency: string
  preselectedTransferDestination?: string
  tokenOptions: IGroupedOptions[] | undefined
  tokenMetadata:
    | ({
        title?: string
        type: TransferModalType
        icon: string
        tokenStandard: TokenStandards
        blockchain: Blockchain
        feeCurrency?: NativeToken
        addressPlaceholder: string
        assetService?: FungibleAsset
        isNativeToken?: boolean
        duration: string
        canisterId?: string
      } & (
        | {
            balance: bigint
            canisterId: string
            fee: bigint
            feeInUsd: number | undefined
            rate: number | undefined
            decimals: number
            owner: Principal
            logo: string
            name: string
            symbol: string
            feeCurrency: string
            toPresentation: (
              value?: bigint | undefined,
              decimals?: number,
            ) => number | string
            transformAmount: (value: string) => number
          }
        | {
            name: string
            symbol: string
            logo?: string
            balance: string
            balanceinUsd: string
            contractAddress?: string
            address: string
            rate?: number | undefined
            decimals: number
          }
      ))
    | undefined
  selectedTokenBlockchain: string
  sendReceiveTrackingFn: () => void
  isVault: boolean
  accountsOptions: IGroupedOptions[] | undefined
  optionGroups: IGroupedOptions[]
  selectedAccountAddress: string
  submit: (values: { amount: string; to: string }) => Promise<void | Id>
  setSelectedAccountAddress: Dispatch<SetStateAction<string>>
  selectedConnector: ITransferFTConnector | undefined
  amountInUSD: number
  setUSDAmount: (value: number) => void
  setSelectedCurrency: (value: string) => void
  setSelectedBlockchain: (value: string) => void
}

export const TransferFTUi: FC<TransferFTUiProps> = ({
  isLoading,
  isBalanceLoading,
  isFeeLoading,
  loadingMessage,
  balance,
  rate,
  decimals,
  transferFee,
  calculateFee,
  selectedTokenCurrency,
  preselectedTransferDestination,
  tokenOptions,
  tokenMetadata,
  selectedTokenBlockchain,
  sendReceiveTrackingFn,
  isVault,
  accountsOptions,
  optionGroups,
  selectedAccountAddress,
  submit,
  setSelectedAccountAddress,
  selectedConnector,
  amountInUSD,
  setUSDAmount,
  setSelectedCurrency,
  setSelectedBlockchain,
}) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    resetField,
  } = useForm({
    mode: "all",
    defaultValues: {
      amount: undefined as any as string,
      to: preselectedTransferDestination ?? "",
    },
  })

  const maxHandler = () => {
    if (transferFee && balance) {
      const balanceNum = new BigNumber(balance.toString())
      const feeNum = new BigNumber(transferFee.toString())
      const val = balanceNum.minus(feeNum)

      if (val.isLessThanOrEqualTo(0)) return

      const formattedValue = formatAssetAmountRaw(Number(val), decimals!)

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
            decimals={decimals!}
            {...register("amount", {
              required: sumRules.errorMessages.required,
              validate: validateTransferAmountField(
                formatAssetAmountRaw(Number(balance), decimals!),
                formatAssetAmountRaw(Number(transferFee!), decimals!),
              ),
              valueAsNumber: true,
              onBlur: calculateFee,
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
                {!tokenMetadata?.icon ? (
                  <NoIcon className="w-[40px] h-[40px] mr-1.5" />
                ) : (
                  <img
                    className="w-[26px] mr-1.5"
                    src={tokenMetadata?.icon}
                    alt={selectedTokenCurrency}
                  />
                )}
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
          placeholder={tokenMetadata?.addressPlaceholder}
          errorText={errors.to?.message}
          registerFunction={register("to", {
            required: "This field cannot be empty",
            validate: (value) => selectedConnector?.validateAddress(value),
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
              <p className="text-sm">
                {tokenMetadata?.blockchain === Blockchain.IC
                  ? "Instant"
                  : "Estimated"}
              </p>
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
          isLoading={isBalanceLoading}
          rate={rate}
          selectedTokenCurrency={selectedTokenCurrency}
          decimals={decimals}
          balance={Number(balance)}
          selectedAccountAddress={selectedAccountAddress}
        />
      </div>
    </BlurredLoader>
  )
}
