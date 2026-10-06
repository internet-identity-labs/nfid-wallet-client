/* eslint-disable @nx/enforce-module-boundaries */
import { FC, useEffect, useState } from "react"
import clsx from "clsx"
import { ModalComponent, sumRules } from "@nfid-frontend/ui"
import { Button, Input } from "@nfid-frontend/ui"

import { Spinner } from "packages/ui/src/atoms/spinner"
import { useForm } from "react-hook-form"
import { TopUpAmountValues, TopUpModalProps } from "../types"

import toaster from "packages/ui/src/atoms/toast"
import { IconReverse } from "packages/ui/src/atoms/icons/reverse"
import { icpToTCycles, tCyclesToIcp } from "frontend/features/vaults/utils"
import { ReactComponent as IcpIcon } from "packages/ui/src/atoms/icons/icp-icon.svg"
import { ICP_DECIMALS, TRIM_ZEROS } from "@nfid/integration/token/constants"

const DEFAULT_ERROR = "Something went wrong. Please try again later"

export const TopUpModal: FC<TopUpModalProps> = ({
  isOpen,
  onClose,
  vaultId,
  xdrPermyriadPerIcp,
  topUp,
  vaultIcpBalance,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [tCyclesValue, setTCyclesValue] = useState("")

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<TopUpAmountValues>({
    mode: "all",
    defaultValues: {
      topUpAmount: "",
    },
  })

  useEffect(() => {
    if (!isOpen) {
      reset()
      setTCyclesValue("")
    }
  }, [isOpen, reset])

  const handleIcpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const icp = parseFloat(e.target.value)
    if (!isNaN(icp) && xdrPermyriadPerIcp) {
      setTCyclesValue(
        icpToTCycles(icp, xdrPermyriadPerIcp)
          .toFixed(3)
          .replace(TRIM_ZEROS, ""),
      )
    } else {
      setTCyclesValue("")
    }
  }

  const handleTCyclesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value)
    if (!isNaN(t) && xdrPermyriadPerIcp) {
      setValue(
        "topUpAmount",
        tCyclesToIcp(t, xdrPermyriadPerIcp)
          .toFixed(ICP_DECIMALS)
          .replace(TRIM_ZEROS, ""),
        {
          shouldValidate: true,
        },
      )
    } else {
      setValue("topUpAmount", "", { shouldValidate: false })
    }
    setTCyclesValue(e.target.value)
  }

  const handleTopUp = async (values: TopUpAmountValues) => {
    try {
      setIsLoading(true)
      await topUp(values.topUpAmount)
      onClose()
    } catch (e) {
      console.error("Top-up error", (e as Error).message)
      toaster.error(DEFAULT_ERROR)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ModalComponent
      isVisible={isOpen}
      onClose={onClose}
      className={clsx(
        "p-5 w-[95%] md:w-[540px] z-[100] !rounded-[24px] !max-h-[90vh] !min-h-1 overflow-auto",
        "scrollbar scrollbar-w-4 scrollbar-thumb-gray-300 snap-end font-inter",
        "scrollbar-thumb-rounded-full scrollbar-track-rounded-full",
        "dark:scrollbar-thumb-zinc-600 dark:scrollbar-track-darkGray",
      )}
    >
      <p className="text-[20px] leading-[26px] font-bold dark:text-white mb-5">
        Top-up canister
      </p>
      <Input
        className="!mb-[18px] w-full"
        disabled
        value={vaultId}
        inputClassName="h-[48px] !border-0 !text-gray-500 dark:!text-zinc-500 !bg-gray-100 dark:!bg-[#FFFFFF0D]"
        labelText="NFID Vault canister ID"
        labelClassName="!text-black dark:!text-white"
      />
      <div className="relative flex items-center mb-4 gap-[13px]">
        <Input
          className="!mb-0 w-full"
          icon={
            <div className="flex items-center gap-1">
              <IcpIcon className="w-[34px] h-[34px]" />
              <span className="leading-[18px] dark:text-white text-sm tracking-[0.3px]">
                ICP
              </span>
            </div>
          }
          iconClassnames="right-[10px] left-auto"
          inputClassName="h-[48px] !border-black dark:!border-zinc-500 !text-black dark:!text-white dark:!bg-[#FFFFFF0D] pr-[80px] !pl-3"
          placeholder="ICP amount"
          labelText="Amount"
          {...register("topUpAmount", {
            required: sumRules.errorMessages.required,
            validate: (value) => {
              if (
                vaultIcpBalance !== undefined &&
                Number(value) > vaultIcpBalance
              )
                return "Insufficient balance"
              return true
            },
            onChange: handleIcpChange,
          })}
          type="number"
          min="0"
          errorText={errors.topUpAmount?.message}
        />
        <IconReverse className="w-6 h-6 mt-5 text-black min-w-6 dark:text-white" />
        <Input
          className="!mb-0 w-full"
          inputClassName="h-[48px] !border-black dark:!border-zinc-500 !text-black dark:!text-white dark:!bg-[#FFFFFF0D] pr-[80px]"
          placeholder="T Cycles amount"
          labelText="T Cycles"
          type="number"
          min="0"
          value={tCyclesValue}
          onChange={handleTCyclesChange}
        />
      </div>
      <p className="leading-[18px] text-sm text-gray-500 dark:text-zinc-400">
        Cycles conversion is approximate.
      </p>

      <Button
        className="w-full mt-[30px]"
        onClick={handleSubmit(handleTopUp)}
        disabled={isLoading || !isValid}
        iconEnd={isLoading ? <Spinner /> : null}
      >
        Initiate transaction
      </Button>
    </ModalComponent>
  )
}
