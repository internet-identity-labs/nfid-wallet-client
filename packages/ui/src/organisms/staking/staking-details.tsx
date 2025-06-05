import { SignIdentity } from "@dfinity/agent"
import { NeuronId } from "@dfinity/sns/dist/candid/sns_governance"
import clsx from "clsx"
import { FC, useCallback, useState } from "react"
import { useForm } from "react-hook-form"

import { FormValues } from "frontend/features/transfer-modal/types"
import { StakedToken } from "frontend/integration/staking/staked-token"
import {
  IStakingDelegates,
  IStakingICPDelegates,
  StakingState,
} from "frontend/integration/staking/types"
import { NotFound } from "frontend/ui/pages/404"

import { IconNftPlaceholder } from "../../atoms/icons"
import ImageWithFallback from "../../atoms/image-with-fallback"
import { Skeleton } from "../../atoms/skeleton"
import { StakingHeaderSkeleton } from "../../atoms/skeleton/staking-header"
import { TableStakingOptionSkeleton } from "../../atoms/skeleton/table-staking-option"
import { Button } from "../../molecules/button"
import { ArrowButton } from "../../molecules/button/arrow-button"
import { Input } from "../../molecules/input"
import { ModalComponent } from "../../molecules/modal/index-v0"
import { StakingHeader } from "./components/staking-header"
import { StakingOption } from "./components/staking-option"
import {
  SidePanelOption,
  StakingSidePanel,
} from "./components/staking-side-panel"

export interface StakingDetailsProps {
  stakedToken?: StakedToken
  isLoading: boolean
  onRedeemOpen: (id: string) => void
  delegates: IStakingDelegates | IStakingICPDelegates | undefined
  updateDelegates: (value: string, userNeuron?: NeuronId) => Promise<void>
  updateICPDelegates: (value: string, userNeuron?: bigint) => Promise<void>
  identity?: SignIdentity
}

export const StakingDetails: FC<StakingDetailsProps> = ({
  stakedToken,
  isLoading,
  onRedeemOpen,
  delegates,
  updateDelegates,
  updateICPDelegates,
  identity,
}) => {
  const [sidePanelOption, setSidePanelOption] =
    useState<SidePanelOption | null>(null)
  const [isStateLoading, setIsStateLoading] = useState(false)
  const [isDelegateLoading, setIsDelegateLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const formMethods = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      userNeuron: "",
    },
  })

  const { watch } = formMethods
  const userNeuron = watch("userNeuron")

  const handleNavigateBack = useCallback(() => {
    window.history.back()
  }, [])

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
        <div className={clsx("flex flex-col")}>
          <div className="text-[20px] leading-[26px] mb-[18px] font-bold">
            Update delegate
          </div>
          <p className="text-sm leading-[22px] mb-[20px]">
            Input a neuron ID to vote on your behalf for this DAO.
          </p>
          <Input
            {...formMethods.register("userNeuron")}
            labelText="Neuron ID"
            inputClassName="!border-black"
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
              onClick={async () => {
                const stakeId = sidePanelOption?.option.getStakeId()
                if (stakeId === undefined) return
                setIsDelegateLoading(true)
                setIsModalOpen(false)

                const update = (neuron: string, id: NeuronId | bigint) => {
                  return typeof id === "bigint"
                    ? updateICPDelegates(neuron, id)
                    : updateDelegates(neuron, id)
                }

                update(userNeuron, stakeId).then(() =>
                  setIsDelegateLoading(false),
                )
              }}
              className="w-[115px]"
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
        setIsLoading={setIsStateLoading}
        isLoading={isStateLoading}
        delegates={delegates}
        setIsModalOpen={setIsModalOpen}
        isDelegateLoading={isDelegateLoading}
      />
      {isLoading || isStateLoading || !stakedToken ? (
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
              buttonClassName="py-[7px]"
              onClick={handleNavigateBack}
              iconClassName="text-black"
            />
            <ImageWithFallback
              alt={stakedToken.getToken().getTokenSymbol()}
              fallbackSrc={IconNftPlaceholder}
              src={stakedToken.getToken().getTokenLogo()}
              className={clsx("w-[62px] h-[62px]", "rounded-full object-cover")}
            />
            <div>
              <p className="text-[28px] leading-[36px]">
                {stakedToken.getToken().getTokenSymbol()}
              </p>
              <p className="text-xs leading-5 text-secondary">
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
