import clsx from "clsx"
import { A } from "packages/ui/src/atoms/custom-link"
import { RangeSlider } from "packages/ui/src/atoms/range-slider"
import { FC, useState } from "react"
import { useFormContext } from "react-hook-form"
import { Id } from "react-toastify"

import {
  Button,
  BlurredLoader,
  Input,
  Tooltip,
  IconInfo,
} from "@nfid-frontend/ui"

import { SendStatus } from "frontend/features/transfer-modal/types"
import { FT } from "frontend/integration/ft/ft"

import { ChooseFromToken } from "./choose-from-token"
import { StakeSuccessUi } from "./stake-success"

export interface StakeUiProps {
  tokens: FT[]
  token: FT | undefined
  setChosenToken: (value: string) => void
  isLoading: boolean
  loadingMessage: string | undefined
  submit: () => Promise<void | Id>
  status: SendStatus
  isSuccessOpen: boolean
  onClose: () => void
  error: string | undefined
  fee: { fee: string; feeInUsd: string }
  rewards: { rewards: string; rewardsInUsd: string }
  apr: string
}

export const StakeUi: FC<StakeUiProps> = ({
  tokens,
  token,
  setChosenToken,
  isLoading,
  loadingMessage,
  submit,
  status,
  isSuccessOpen,
  onClose,
  error,
  fee,
  rewards,
  apr,
}) => {
  const {
    resetField,
    watch,
    setValue,
    register,
    formState: { errors },
    trigger,
  } = useFormContext()

  const amount = watch("amount")
  const lockTime = watch("lockTime")
  const [lockValue, setLockValue] = useState(0)

  console.log(lockValue)

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
      <StakeSuccessUi
        title={`${amount} ${token.getTokenSymbol()}`}
        subTitle={`${token.getTokenRateFormatted(amount || 0)}`}
        onClose={onClose}
        assetImg={`${token.getTokenLogo()}`}
        isOpen={isSuccessOpen}
        status={status}
        assetImageClassname="w-[74px] h-[74px] top-[51px]"
        error={error}
      />
      <div
        className={clsx(
          "leading-[24px] text-[20px] font-bold mb-[18px]",
          "flex justify-between items-center",
        )}
      >
        <span>Stake</span>
        <Tooltip
          align="end"
          alignOffset={-20}
          tip={
            <>
              <span className="block max-w-[330px] mb-4">
                Your rewards are proportional to the lock time. <br />
                <br />A 0.0875% staking fee will be applied on the rewards
                earned at redemption.
              </span>
              <A
                target="_blank"
                href="https://internetcomputer.org/docs/building-apps/governing-apps/nns/concepts/neurons/staking-voting-rewards"
              >
                Read More
              </A>
            </>
          }
        >
          <img
            src={IconInfo}
            alt="icon"
            className="w-[20px] h-[20px] transition-all cursor-pointer hover:opacity-70"
          />
        </Tooltip>
      </div>
      <p className="mb-1 text-xs">Amount to stake</p>
      <ChooseFromToken
        token={token}
        setFromChosenToken={setChosenToken}
        usdRate={token.getTokenRateFormatted(amount || 0)}
        tokens={tokens}
        title="Amount to stake"
      />
      <div className="h-4 mt-1 text-xs leading-4 text-red-600">
        {errors["amount"]?.message as string}
      </div>
      <p className="mb-1 text-xs">Lock time</p>
      <div>
        <Input
          className="mb-[-9px]"
          inputClassName="h-[60px] !border-black border-b-0 rounded-b-none !bg-white !text-black"
          value="6 years 6 months"
          disabled
          {...register("lockTime")}
        />
        <RangeSlider
          value={lockValue}
          setValue={setLockValue}
          min={0}
          max={8}
          step={1}
        />
      </div>
      <div className="my-[20px] text-sm">
        <div className="flex items-center justify-between h-[48px]">
          <p>Est. APR</p>
          <p className="font-bold text-green-600">{apr}</p>
        </div>
        <div className="flex items-center justify-between h-[48px]">
          <p>Transaction fee</p>
          <div className="text-right">
            <p className="leading-[22px]">{fee.fee}</p>
            <p className="text-xs leading-[20px] text-secondary">
              {fee.feeInUsd}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between h-[48px]">
          <p>Projected rewards</p>
          <div className="text-right">
            <p className="leading-[22px] font-bold">{rewards.rewards}</p>
            <p className="text-xs leading-[20px] text-secondary">
              {rewards.rewardsInUsd}
            </p>
          </div>
        </div>
      </div>
      <div className="flex gap-[20px]">
        <Button type="stroke" id="cancelStakeButton" block onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={false}
          type="primary"
          id="stakeButton"
          block
          onClick={submit}
        >
          Stake
        </Button>
      </div>
    </>
  )
}
