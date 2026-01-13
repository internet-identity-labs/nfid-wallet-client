import { SignIdentity } from "@dfinity/agent"
import { NeuronId } from "@dfinity/sns/dist/candid/sns_governance"
import clsx from "clsx"
import { FC, useCallback, useState } from "react"
import { useForm } from "react-hook-form"

import { mutate } from "@nfid/swr"

import { fetchStakedTokens } from "frontend/features/staking/utils"
import { NeuronFormValues } from "frontend/features/transfer-modal/types"
import { StakedToken } from "frontend/integration/staking/staked-token"
import {
  IStakingDelegates,
  IStakingICPDelegates,
  StakingState,
} from "frontend/integration/staking/types"
import { NotFound } from "@nfid/ui/pages/404"

import { IconNftPlaceholder } from "@nfid/ui/atoms/icons"
import ImageWithFallback from "@nfid/ui/atoms/image-with-fallback"
import { Skeleton } from "@nfid/ui/atoms/skeleton"
import { StakingHeaderSkeleton } from "@nfid/ui/atoms/skeleton/staking-header"
import { TableStakingOptionSkeleton } from "@nfid/ui/atoms/skeleton/table-staking-option"
import { Button } from "@nfid/ui/molecules/button"
import { ArrowButton } from "@nfid/ui/molecules/button/arrow-button"
import { Input } from "@nfid/ui/molecules/input"
import { ModalComponent } from "@nfid/ui/molecules/modal"
import { StakingHeader } from "./components/staking-header"
import { StakingOption } from "./components/staking-option"
import {
  SidePanelOption,
  StakingSidePanel,
} from "./components/staking-side-panel"
import { FT } from "frontend/integration/ft/ft"

export interface StakingDetailsProps {
  stakedToken?: StakedToken
  isLoading: boolean
  onRedeemOpen: (id: string) => void
  delegates: IStakingDelegates | IStakingICPDelegates | undefined
  updateDelegates: (value: string, userNeuron?: NeuronId) => Promise<void>
  updateICPDelegates: (value: string, userNeuron?: bigint) => Promise<void>
  identity?: SignIdentity
  validateNeuron: (neuronId: string) => Promise<true | string>
  initedTokens?: FT[]
}

export const StakingDetails: FC<StakingDetailsProps> = ({
  stakedToken,
  isLoading,
  onRedeemOpen,
  delegates,
  updateDelegates,
  updateICPDelegates,
  identity,
  validateNeuron,
  initedTokens,
}) => {
  const [sidePanelOption, setSidePanelOption] =
    useState<SidePanelOption | null>(null)
  const [isDelegateLoading, setIsDelegateLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const {
    register,
    watch,
    setError,
    formState: { errors },
    handleSubmit,
  } = useForm({
    mode: "all",
    defaultValues: {
      userNeuron: "",
    },
  })

  const userNeuron = watch("userNeuron")

  const handleNavigateBack = useCallback(() => {
    window.history.back()
  }, [])

  const submit = async (data: NeuronFormValues) => {
    const { userNeuron } = data

    const isCorrectNeuron = await validateNeuron(userNeuron)

    if (isCorrectNeuron !== true) {
      setError("userNeuron", {
        type: "manual",
        message: isCorrectNeuron,
      })
      return
    }

    const stakeId = sidePanelOption?.option.getStakeId()
    if (stakeId === undefined) return
    setIsDelegateLoading(true)
    setIsModalOpen(false)

    const update = (neuron: string, id: NeuronId | bigint) => {
      return typeof id === "bigint"
        ? updateICPDelegates(neuron, id)
        : updateDelegates(neuron, id)
    }

    update(userNeuron, stakeId).then(async () => {
      if (!initedTokens) return
      await mutate(
        initedTokens ? "stakedTokens" : null,
        () => fetchStakedTokens(initedTokens, true),
        {
          revalidate: true,
        },
      )

      setIsDelegateLoading(false)
      setIsModalOpen(false)
      setSidePanelOption(null)
    })
  }

  if (!stakedToken && !isLoading) return <NotFound />

  return (
    <>
      <ModalComponent
        isVisible={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
        }}
        className="p-5 w-[95%] md:w-[540px] z-[100] !rounded-[24px]"
      >
        <div className={clsx("flex flex-col dark:text-white")}>
          <div className="text-[20px] leading-[26px] mb-[18px] font-bold">
            Update delegate
          </div>
          <p className="text-sm leading-[22px] mb-[20px]">
            Input a neuron ID to vote on your behalf for this DAO.
          </p>
          <Input
            {...register("userNeuron", {
              required: "This field is required",
            })}
            errorText={errors.userNeuron?.message}
            labelText="Neuron ID"
            inputClassName="!border-black dark:!border-zinc-500"
          />
          <div className="flex gap-[10px] justify-end mt-[20px]">
            <Button
              type="stroke"
              onClick={() => setIsModalOpen(false)}
              className="w-[115px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(submit)}
              className="w-[115px]"
              disabled={Boolean(errors["userNeuron"]?.message) || !userNeuron}
            >
              Update
            </Button>
          </div>
        </div>
      </ModalComponent>
      <StakingSidePanel
        isOpen={Boolean(sidePanelOption)}
        onClose={() => setSidePanelOption(null)}
        sidePanelOption={sidePanelOption}
        onRedeemOpen={onRedeemOpen}
        identity={identity}
        delegates={delegates}
        setIsModalOpen={setIsModalOpen}
        isDelegateLoading={isDelegateLoading}
        initedTokens={initedTokens}
      />
      {isLoading || !stakedToken ? (
        <>
          <div className="flex gap-[10px] items-center mb-[30px]">
            <div className="px-[15px]">
              <Skeleton className="w-[22px] h-[34px]" />
            </div>

            <Skeleton className="w-[62px] h-[62px] rounded-full" />
            <div>
              <Skeleton className="w-[120px] h-[30px] mb-[6px]" />
              <Skeleton className="w-[100px] h-[20px]" />
            </div>
          </div>
          <StakingHeaderSkeleton />
          <TableStakingOptionSkeleton tableRowsAmount={3} tableCellAmount={4} />
        </>
      ) : (
        <>
          <div className="flex gap-[10px] items-center mb-[30px]">
            <ArrowButton
              buttonClassName="py-[7px] dark:hover:bg-zinc-700"
              onClick={handleNavigateBack}
              iconClassName="text-black dark:text-white"
            />
            <ImageWithFallback
              alt={stakedToken.getToken().getTokenSymbol()}
              fallbackSrc={IconNftPlaceholder}
              src={stakedToken.getToken().getTokenLogo()}
              className={clsx("w-[62px] h-[62px]", "rounded-full object-cover")}
            />
            <div>
              <p className="text-[28px] leading-[36px] dark:text-white">
                {stakedToken.getToken().getTokenSymbol()}
              </p>
              <p className="text-xs leading-5 text-secondary dark:text-zinc-500">
                {stakedToken.getToken().getTokenName()}
              </p>
            </div>
          </div>
          <StakingHeader
            total={stakedToken.getStakingBalanceFormatted()}
            rewards={stakedToken.getRewardsFormatted()}
            staked={stakedToken.getStakedFormatted()}
            symbol={stakedToken.getToken().getTokenSymbol()}
          />
          {stakedToken.getAvailable().length > 0 && (
            <StakingOption
              stakingState={StakingState.Available}
              stakes={stakedToken.getAvailable()}
              setSidePanelOption={setSidePanelOption}
              symbol={stakedToken.getToken().getTokenSymbol()}
            />
          )}
          {stakedToken.getUnlocking().length > 0 && (
            <StakingOption
              stakingState={StakingState.Unlocking}
              stakes={stakedToken.getUnlocking()}
              setSidePanelOption={setSidePanelOption}
              symbol={stakedToken.getToken().getTokenSymbol()}
            />
          )}
          {stakedToken.getLocked().length > 0 && (
            <StakingOption
              stakingState={StakingState.Locked}
              stakes={stakedToken.getLocked()}
              setSidePanelOption={setSidePanelOption}
              symbol={stakedToken.getToken().getTokenSymbol()}
            />
          )}
        </>
      )}
    </>
  )
}
