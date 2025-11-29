import { Spinner } from "packages/ui/src/atoms/spinner"
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { Id } from "react-toastify"

import {
  Button,
  IconCmpArrow,
  BlurredLoader,
  IGroupedOptions,
  ChooseAccountModal,
  Skeleton,
} from "@nfid-frontend/ui"
import {
  BTC_NATIVE_ID,
  ETH_NATIVE_ID,
  ICP_CANISTER_ID,
} from "@nfid/integration/token/constants"

import { SendStatus } from "frontend/features/transfer-modal/types"
import { FT } from "frontend/integration/ft/ft"

import { IModalType } from "../utils"
import { ChooseFromToken } from "./choose-from-token"
import { SendSuccessUi } from "./send-success"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

export interface TransferFTUiProps {
  tokens: FT[]
  token: FT | undefined
  setChosenToken: (value: string) => void
  validateAddress: (address: string) => boolean | string
  isLoading: boolean
  isBtcEthLoading: boolean
  loadingMessage: string | undefined
  isVault: boolean
  accountsOptions: IGroupedOptions[] | undefined
  optionGroups: IGroupedOptions[]
  selectedVaultsAccountAddress: string
  submit: () => Promise<void | Id>
  setSelectedVaultsAccountAddress: Dispatch<SetStateAction<string>>
  vaultsBalance?: bigint | undefined
  status: SendStatus
  isSuccessOpen: boolean
  onClose: () => void
  error: string | undefined
  feeError: string | undefined
  fee?: bigint
  isFeeLoading: boolean
  setSkipFeeCalculation: () => void
}

export const TransferFTUi: FC<TransferFTUiProps> = ({
  tokens,
  token,
  setChosenToken,
  validateAddress,
  isLoading,
  isBtcEthLoading,
  loadingMessage,
  isVault,
  accountsOptions,
  optionGroups,
  selectedVaultsAccountAddress,
  submit,
  setSelectedVaultsAccountAddress,
  vaultsBalance,
  status,
  isSuccessOpen,
  onClose,
  error,
  feeError,
  fee,
  isFeeLoading,
  setSkipFeeCalculation,
}) => {
  const [isFromResponsive, setIsFromResponsive] = useState(false)
  const {
    resetField,
    watch,
    setValue,
    register,
    formState: { errors },
    trigger,
  } = useFormContext()

  const amount = watch("amount")
  const to = watch("to")

  useEffect(() => {
    if (to.length) trigger("to")
  }, [token, to])

  const isBtc = token?.getChainId() === ChainId.BTC
  const isEth = token?.getChainId() === ChainId.ETH

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
      <SendSuccessUi
        title={`${amount} ${token.getTokenSymbol()}`}
        subTitle={`${token.getTokenRateFormatted(amount || 0)}`}
        onClose={onClose}
        assetImg={`${token.getTokenLogo()}`}
        isOpen={isSuccessOpen}
        status={status}
        assetImageClassname="w-[100px] h-[100px] top-[161px] sm:w-[115px] sm:h-[115px] sm:top-[154px]"
        error={error}
        isNativeBtc={token.getTokenAddress() === BTC_NATIVE_ID}
        isNativeEth={token.getTokenAddress() === ETH_NATIVE_ID}
      />
      <p className="mb-1 text-xs dark:text-white">Amount to send</p>
      <ChooseFromToken
        modalType={IModalType.SEND}
        id={"token-to-send-title"}
        token={token}
        balance={vaultsBalance}
        fee={fee}
        setFromChosenToken={setChosenToken}
        usdRate={token.getTokenRateFormatted(amount || 0)}
        tokens={tokens}
        title="Token to send"
        setSkipFeeCalculation={setSkipFeeCalculation}
        isBtcEthLoading={isBtcEthLoading}
        isResponsive={isFromResponsive}
        setIsResponsive={setIsFromResponsive}
      />
      <div className="h-4 mt-1 text-xs leading-4 text-red-600 dark:text-red-500">
        {errors["amount"]?.message as string}
      </div>
      {isVault && (
        <ChooseAccountModal
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
      <ChooseAccountModal
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
        errorText={errors["to"]?.message as string}
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
        <div className="text-xs text-gray-500 dark:text-zinc-400">
          Network fee
        </div>
        <div>
          <div className="text-right">
            <p
              className="text-xs leading-5 text-gray-600 dark:text-zinc-400"
              id="fee"
            >
              {isBtc || isEth ? (
                !amount || errors?.["amount"] ? null : !fee || isFeeLoading ? (
                  <>
                    <Skeleton className="w-[80px] h-5" />
                    <span className="block mt-1 text-xs">
                      <Skeleton className="w-[60px] h-4 ml-auto" />
                    </span>
                  </>
                ) : (
                  <>
                    {token.getTokenFeeFormatted(fee)}
                    <span className="block mt-1 text-xs">
                      {token.getTokenFeeFormattedUsd(fee)}
                    </span>
                  </>
                )
              ) : !fee || isFeeLoading ? (
                <>
                  <Skeleton className="w-[80px] h-5" />
                  <span className="block mt-1 text-xs">
                    <Skeleton className="w-[60px] h-4 ml-auto" />
                  </span>
                </>
              ) : (
                <>
                  {token.getTokenFeeFormatted(fee)}
                  <span className="block mt-1 text-xs">
                    {token.getTokenFeeFormattedUsd(fee)}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
      {feeError && (
        <div className="mt-2 text-xs text-red-600 dark:text-red-500">
          {feeError}
        </div>
      )}
      <Button
        className="absolute bottom-5 left-5 right-5 !w-auto"
        disabled={
          Boolean(errors["amount"]?.message) ||
          Boolean(errors["to"]?.message) ||
          !amount ||
          !to ||
          (token?.getTokenAddress() === BTC_NATIVE_ID && !fee) ||
          (token?.getTokenAddress() === ETH_NATIVE_ID && !fee)
        }
        type="primary"
        id="sendButton"
        block
        onClick={submit}
        icon={
          isFeeLoading &&
          (token.getTokenAddress() === BTC_NATIVE_ID ||
            token.getTokenAddress() === ETH_NATIVE_ID) &&
          !errors["amount"] &&
          !feeError ? (
            <Spinner className="w-5 h-5 text-white" />
          ) : (
            <IconCmpArrow className="rotate-[135deg] !max-w-5 !max-h-5" />
          )
        }
      >
        {isFeeLoading &&
        (token.getTokenAddress() === BTC_NATIVE_ID ||
          token.getTokenAddress() === ETH_NATIVE_ID) &&
        !errors["amount"] &&
        !feeError
          ? "Calculating fee"
          : "Send"}
      </Button>
    </>
  )
}
