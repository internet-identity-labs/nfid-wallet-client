import clsx from "clsx"
import { A } from "packages/ui/src/atoms/custom-link"
import { RangeSlider } from "packages/ui/src/atoms/range-slider"
import { FC, useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { Id } from "react-toastify"

import {
  Button,
  BlurredLoader,
  Input,
  Tooltip,
  IconInfo,
  IconCmpStake,
  Skeleton,
} from "@nfid-frontend/ui"

import { SendStatus } from "frontend/features/transfer-modal/types"
import { FT } from "frontend/integration/ft/ft"
import { StakeParamsCalculator } from "frontend/integration/staking/stake-params-calculator"
import { TokenValue } from "frontend/integration/staking/types"

import DiamondIcon from "../../staking/assets/diamond.svg"
import { getFormattedPeriod } from "../utils"
import { ChooseFromToken } from "./choose-from-token"
import { StakeSuccessUi } from "./stake-success"

const SECONDS_IN_MONTH = (60 * 60 * 24 * 365.25) / 12

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
  lockValue?: number
  setLockValue: (v: number) => void
  lockValueInMonths?: number
  setLockValueInMonths: (v: number) => void
  stakingParams?: StakeParamsCalculator
  isParamsLoading: boolean
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
  lockValue,
  setLockValue,
  lockValueInMonths,
  setLockValueInMonths,
  stakingParams,
  isParamsLoading,
}) => {
  const {
    watch,
    register,
    formState: { errors },
  } = useFormContext()
  const [apr, setApr] = useState<string | undefined>()
  const [rewards, setRewards] = useState<TokenValue | undefined>()
  const [isRewardsLoading, setIsRewardsLoading] = useState(false)
  const amount = watch("amount")

  useEffect(() => {
    if (!lockValueInMonths || !lockValue) return

    const fetchData = async () => {
      setIsRewardsLoading(true)

      const [aprData, rewardsData] = await Promise.all([
        stakingParams?.calculateEstAPR(lockValueInMonths, lockValue),
        stakingParams?.calculateProjectRewards(amount, lockValueInMonths),
      ])

      setApr(aprData)
      setRewards(rewardsData)
      setIsRewardsLoading(false)
    }

    fetchData()
  }, [stakingParams, lockValue])

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
        error={error}
      />
      <div
        className={clsx(
          "leading-[24px] text-[20px] font-bold mb-[18px]",
          "flex justify-between items-center",
        )}
      >
        <div className="flex items-center gap-1.5">
          <span>Stake</span>
          {lockValueInMonths ===
            stakingParams?.getMaximumLockTimeInMonths() && (
            <Tooltip
              align="start"
              alignOffset={-20}
              tip={
                <span className="block max-w-[330px] mb-4">
                  You've chosen the maximum lock time—diamond hands unlocked!
                  Enjoy the highest reward rate and extra perks from the
                  developer community.
                </span>
              }
            >
              <img className="w-6 h-6 cursor-pointer" src={DiamondIcon} />
            </Tooltip>
          )}
        </div>
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
        minAmount={stakingParams?.getMinimumToStake()}
        isLoading={isParamsLoading || !stakingParams}
      />
      {Boolean(errors["amount"]?.message) && (
        <div className="h-4 mt-1 text-xs leading-4 text-red-600">
          {errors["amount"]?.message as string}
        </div>
      )}
      <p className="mt-[20px] mb-1 text-xs">Lock time</p>
      {isParamsLoading || !stakingParams ? (
        <Skeleton className="w-full h-[99px]" />
      ) : (
        <div>
          <Input
            className="mb-[-11px]"
            inputClassName="h-[60px] !border-black border-b-0 rounded-b-none !bg-white !text-black"
            value={getFormattedPeriod(lockValueInMonths, true)}
            disabled
            {...register("lockTime")}
          />
          <RangeSlider
            value={
              lockValueInMonths || stakingParams?.getMinimumLockTimeInMonths()
            }
            setValue={(value) => {
              setLockValue(value * SECONDS_IN_MONTH)
              setLockValueInMonths(value)
            }}
            min={stakingParams?.getMinimumLockTimeInMonths()}
            max={stakingParams?.getMaximumLockTimeInMonths()}
            step={1}
          />
        </div>
      )}
      <div
        className={clsx(
          "text-sm",
          !Boolean(errors["amount"]?.message) ? "my-[24px]" : "my-[14px]",
        )}
      >
        <div className="flex items-center justify-between h-[48px]">
          <p>Est. APR</p>
          {isParamsLoading || isRewardsLoading ? (
            <Skeleton className="w-[35px] h-[20px]" />
          ) : (
            <p className="font-bold text-green-600">{apr}</p>
          )}
        </div>
        <div className="flex items-center justify-between h-[48px]">
          <p>Transaction fee</p>
          <div className="text-right">
            {isParamsLoading ? (
              <>
                <Skeleton className="w-[70px] h-[22px]" />
                <Skeleton className="mt-1 w-[50px] h-[20px] ml-auto" />
              </>
            ) : (
              <>
                <p className="leading-[22px]">
                  {stakingParams?.getFee().getTokenValue()}
                </p>
                <p className="text-xs leading-[20px] text-secondary">
                  {stakingParams?.getFee().getUSDValue()}
                </p>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between h-[48px]">
          <p>Projected rewards</p>
          <div className="text-right">
            {isParamsLoading || isRewardsLoading ? (
              <>
                <Skeleton className="w-[70px] h-[22px]" />
                <Skeleton className="mt-1 w-[50px] h-[20px] ml-auto" />
              </>
            ) : (
              <>
                <p className="leading-[22px] font-bold">
                  {rewards?.getTokenValue()}
                </p>
                <p className="text-xs leading-[20px] text-secondary">
                  {rewards?.getUSDValue()}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      <Button
        disabled={Boolean(errors["amount"]?.message) || !amount}
        type="primary"
        id="stakeButton"
        block
        onClick={submit}
        icon={<IconCmpStake className="!w-[18px] !h-[18px] text-white" />}
      >
        Stake
      </Button>
    </>
  )
}
