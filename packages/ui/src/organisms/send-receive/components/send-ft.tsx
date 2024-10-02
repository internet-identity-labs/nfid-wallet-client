import { Spinner } from "packages/ui/src/atoms/loader/spinner"
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { Id } from "react-toastify"
import useSWR from "swr"

import {
  Button,
  ChooseModal,
  IconCmpArrow,
  BlurredLoader,
  IGroupedOptions,
} from "@nfid-frontend/ui"
import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"

import { FT } from "frontend/integration/ft/ft"

import { ChooseFromToken } from "./choose-from-token"

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
  submit: () => Promise<void | Id>
  setSelectedVaultsAccountAddress: Dispatch<SetStateAction<string>>
  vaultsBalance?: bigint | undefined
  usdRate?: string
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
  vaultsBalance,
  usdRate,
}) => {
  const {
    resetField,
    watch,
    setValue,
    register,
    formState: { errors },
  } = useFormContext()

  const amount = watch("amount")
  const to = watch("to")

  const { data: tokenFeeUsd, isLoading: isFeeLoading } = useSWR(
    token ? ["tokenFee", token.getTokenAddress()] : null,
    token ? () => token.getTokenFeeFormattedUsd() : null,
  )

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
      <ChooseFromToken
        token={token}
        balance={vaultsBalance}
        setFromChosenToken={setChosenToken}
        sendReceiveTrackingFn={sendReceiveTrackingFn}
        usdRate={usdRate}
        tokens={tokens}
        title="Token to send"
      />
      <div className="h-4 mt-1 text-xs leading-4 text-red-600">
        {errors["amount"]?.message as string}
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
        <div className="text-xs text-gray-500">Network fee</div>
        <div>
          {isFeeLoading ? (
            <Spinner className="w-3 h-3 text-gray-400" />
          ) : (
            <div className="text-right">
              <p className="text-xs leading-5 text-gray-600" id="fee">
                {token.getTokenFeeFormatted()}
                <span className="block mt-1 text-xs">{tokenFeeUsd}</span>
              </p>
            </div>
          )}
        </div>
      </div>
      <Button
        className="h-[48px] absolute bottom-5 left-5 right-5 !w-auto"
        disabled={
          Boolean(errors["amount"]?.message) ||
          Boolean(errors["to"]?.message) ||
          !amount ||
          !to
        }
        type="primary"
        id="sendFT"
        block
        onClick={submit}
        icon={<IconCmpArrow className="rotate-[135deg]" />}
      >
        Send
      </Button>
    </>
  )
}
