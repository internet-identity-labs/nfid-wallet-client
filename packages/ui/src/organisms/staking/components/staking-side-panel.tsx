import { SignIdentity } from "@dfinity/agent"
import { Followees as IcpFollowees, Topic } from "@dfinity/nns"
import { uint8ArrayToHexString } from "@dfinity/utils"
import clsx from "clsx"
import { motion } from "framer-motion"
import { A } from "packages/ui/src/atoms/custom-link"
import { IconInfo, IconInfoDark } from "packages/ui/src/atoms/icons"
import { IconCaret } from "packages/ui/src/atoms/icons/caret"
import { Spinner } from "packages/ui/src/atoms/spinner"
import { Button } from "packages/ui/src/molecules/button"
import { ArrowButton } from "packages/ui/src/molecules/button/arrow-button"
import CopyAddress from "packages/ui/src/molecules/copy-address"
import { useDisableScroll } from "packages/ui/src/molecules/modal/hooks/disable-scroll"
import { Tooltip } from "packages/ui/src/molecules/tooltip"
import { FC, useMemo, useState } from "react"

import { mutate } from "@nfid/swr"

import {
  fetchStakedTokens,
  isSNSFollowees,
} from "frontend/features/staking/utils"
import { useDarkTheme } from "frontend/hooks"
import { NFIDNeuron } from "frontend/integration/staking/nfid-neuron"
import {
  IStakingDelegates,
  IStakingICPDelegates,
  StakingState,
} from "frontend/integration/staking/types"

import { getFormattedPeriod } from "../../send-receive/utils"
import { StakingDelegates } from "./staking-delegation"
import { FT } from "frontend/integration/ft/ft"

export interface SidePanelOption {
  option: NFIDNeuron
  state: StakingState
}

export interface StakingSidePanelProps {
  isOpen: boolean
  onClose: () => void
  sidePanelOption: SidePanelOption | null
  onRedeemOpen: (id: string) => void
  identity?: SignIdentity
  isDelegateLoading: boolean
  delegates: IStakingDelegates | IStakingICPDelegates | undefined
  setIsModalOpen: (value: boolean) => void
  initedTokens?: FT[]
}

export const StakingSidePanel: FC<StakingSidePanelProps> = ({
  isOpen,
  onClose,
  sidePanelOption,
  onRedeemOpen,
  identity,
  isDelegateLoading,
  delegates,
  setIsModalOpen,
  initedTokens,
}) => {
  const isDarkTheme = useDarkTheme()
  const [isStakingDelegatesOpen, setIsStakingDelegatesOpen] = useState(false)
  useDisableScroll(isOpen)
  const [isLoading, setIsLoading] = useState(false)

  const followees = useMemo(() => {
    const followees = sidePanelOption?.option.getFollowees()

    if (!followees || !delegates) return

    if (isSNSFollowees(followees, delegates)) {
      return followees.map(([topicId, followee]) => ({
        name: (delegates as IStakingDelegates)?.functions.find(
          (f) => f.id === topicId,
        )?.name,
        id: uint8ArrayToHexString(followee.followees[0].id),
      }))
    }

    return (followees as IcpFollowees[]).map((followee) => ({
      name: (delegates as Partial<Record<Topic, string>>)?.[followee.topic],
      id: followee.followees[0]?.toString(),
    }))
  }, [sidePanelOption?.option, delegates])

  const symbol = sidePanelOption?.option.getToken().getTokenSymbol()

  const openRedeemModal = async () => {
    if (!sidePanelOption) return

    onRedeemOpen(sidePanelOption.option.getStakeIdFormatted())
    onClose()
  }

  const stopUnlocking = () => {
    if (!identity || !initedTokens) return
    setIsLoading(true)
    sidePanelOption?.option.stopUnlocking(identity).then(async () => {
      await mutate(
        "stakedTokens",
        () => fetchStakedTokens(initedTokens, true),
        {
          revalidate: true,
        },
      )
      onClose()
      setIsLoading(false)
    })
  }

  const startUnlocking = async () => {
    if (!identity || !initedTokens) return
    setIsLoading(true)
    sidePanelOption?.option.startUnlocking(identity).then(async () => {
      await mutate(
        "stakedTokens",
        () => fetchStakedTokens(initedTokens, true),
        {
          revalidate: true,
        },
      )
      onClose()
      setIsLoading(false)
    })
  }

  return (
    <div>
      <div
        onClick={() =>
          isStakingDelegatesOpen ? setIsStakingDelegatesOpen(false) : onClose()
        }
        className={clsx(
          "fixed inset-0 z-48 left-0 top-0",
          "w-screen h-screen",
          !isOpen && "hidden",
        )}
      />
      <div
        className={clsx(
          "w-[90vw] md:w-[600px] h-screen fixed top-0 right-0 transition-all duration-500",
          "bg-white dark:bg-darkGray shadow-[0px_4px_40px_rgba(0,0,0,0.2)] z-[49] transform p-[30px] overflow-auto",
          !isOpen ? "translate-x-[800px]" : "translate-x-0",
        )}
      >
        {!sidePanelOption ? null : (
          <>
            <div className="flex items-center justify-between h-[70px]">
              <div className="flex space-x-2.5 items-center">
                <ArrowButton
                  buttonClassName="py-[7px] dark:hover:bg-zinc-700"
                  onClick={() =>
                    isStakingDelegatesOpen
                      ? setIsStakingDelegatesOpen(false)
                      : onClose()
                  }
                  iconClassName="text-black dark:text-white"
                />
                <p className="text-[28px] dark:text-white">
                  {isStakingDelegatesOpen
                    ? "Voting delegates"
                    : "Staking details"}
                </p>
              </div>
              {!isStakingDelegatesOpen && (
                <p className="text-sm text-right text-secondary dark:text-zinc-500">
                  {sidePanelOption.state}
                </p>
              )}
            </div>
            {isStakingDelegatesOpen && (
              <div className="mb-[20px] dark:text-white">
                The below delegates are voting on your behalf. Use Toolkit IC to
                change your delegates or vote manually.
              </div>
            )}
            {isStakingDelegatesOpen && followees ? (
              <StakingDelegates
                followees={followees}
                setIsModalOpen={setIsModalOpen}
                isDelegateLoading={isDelegateLoading}
              />
            ) : (
              <motion.div
                key="StakingPanel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="border border-gray-200 dark:border-zinc-700 rounded-3xl px-[30px] py-[20px] relative">
                  <div>
                    <div className="grid grid-cols-[160px,1fr] text-sm items-center h-[54px]">
                      <div className="flex items-center gap-1">
                        <p className="text-gray-400 dark:text-zinc-500">
                          Stake ID
                        </p>
                        <Tooltip
                          align="start"
                          alignOffset={-20}
                          tip={
                            <span className="block max-w-[300px]">
                              Stake IDs are synonymous to “neuron IDs” in other
                              systems like the NNS.
                            </span>
                          }
                        >
                          <img
                            src={isDarkTheme ? IconInfoDark : IconInfo}
                            alt="icon"
                            className="w-[20px] h-[20px] transition-all cursor-pointer hover:opacity-70"
                          />
                        </Tooltip>
                      </div>
                      <div id={"sidePanel-stakeID"}>
                        <CopyAddress
                          className="dark:text-white"
                          address={sidePanelOption.option.getStakeIdFormatted()}
                          trailingChars={4}
                          leadingChars={6}
                        />
                      </div>
                    </div>
                    <div className="w-full h-[1px] w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
                    <div className="grid grid-cols-[160px,1fr] text-sm items-center h-[54px]">
                      <p className="text-gray-400 dark:text-zinc-500">
                        Initial stake
                      </p>
                      <div>
                        <p
                          className="dark:text-white"
                          id={"sidePanel-initialStake"}
                        >
                          {sidePanelOption.option
                            .getInitialStakeFormatted()
                            .getTokenValue()}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-zinc-500">
                          {sidePanelOption.option
                            .getInitialStakeFormatted()
                            .getUSDValue()}
                        </p>
                      </div>
                    </div>
                    <div className="w-full h-[1px] w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
                    <div className="grid grid-cols-[160px,1fr] text-sm items-center h-[54px]">
                      <div className="flex items-center gap-1">
                        <p className="text-gray-400 dark:text-zinc-500">
                          Rewards
                        </p>
                        <Tooltip
                          align="start"
                          alignOffset={-20}
                          tip={
                            <>
                              <span className="block max-w-[300px] mb-4">
                                Rewards are earned in “maturity”, which will
                                convert to {symbol} at the time of stake
                                withdrawal.
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
                            src={isDarkTheme ? IconInfoDark : IconInfo}
                            alt="icon"
                            className="w-[20px] h-[20px] transition-all cursor-pointer hover:opacity-70"
                          />
                        </Tooltip>
                      </div>
                      <div>
                        <p id={"sidePanel-rewards"} className="dark:text-white">
                          {sidePanelOption.option
                            .getRewardsFormatted()
                            .getTokenValue()}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-zinc-500">
                          {sidePanelOption.option
                            .getRewardsFormatted()
                            .getUSDValue()}
                        </p>
                      </div>
                    </div>
                    <div className="w-full h-[1px] w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
                    <div className="grid grid-cols-[160px,1fr] text-sm items-center h-[54px]">
                      <div className="flex items-center gap-1">
                        <p className="text-gray-400 dark:text-zinc-500">
                          Total value
                        </p>
                        <Tooltip
                          align="start"
                          alignOffset={-20}
                          tip={
                            <span className="block max-w-[280px]">
                              Total value assumes maturity will convert to{" "}
                              {symbol} on a 1:1 ratio.
                            </span>
                          }
                        >
                          <img
                            src={isDarkTheme ? IconInfoDark : IconInfo}
                            alt="icon"
                            className="w-[20px] h-[20px] transition-all cursor-pointer hover:opacity-70"
                          />
                        </Tooltip>
                      </div>
                      <div>
                        <p
                          id={"sidePanel-totalValue"}
                          className="font-bold dark:text-white"
                        >
                          {sidePanelOption.option
                            .getTotalValueFormatted()
                            .getTokenValue()}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-zinc-500">
                          {sidePanelOption.option
                            .getTotalValueFormatted()
                            .getUSDValue()}
                        </p>
                      </div>
                    </div>
                    {sidePanelOption.state === StakingState.Unlocking && (
                      <>
                        <div className="w-full h-[1px] w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
                        <div className="grid grid-cols-[160px,1fr] text-sm items-center h-[54px]">
                          <p className="text-gray-400 dark:text-zinc-500">
                            Unlock in
                          </p>
                          <div>
                            <p
                              id={"sidePanel-unlockTime"}
                              className="dark:text-white"
                            >
                              {sidePanelOption.option.getUnlockInMonths()}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="border border-gray-200 dark:border-zinc-700 rounded-3xl px-[30px] pb-[30px] pt-[16px] mt-5">
                  <div className="text-[24px] leading-[50px] mb-[10px] dark:text-white">
                    Details
                  </div>
                  <div className="grid grid-cols-[160px,1fr] text-sm items-center h-[54px]">
                    <p className="text-gray-400 dark:text-zinc-500">
                      Date created
                    </p>
                    <div>
                      <p
                        id={"sidePanel-dateCreated"}
                        className="dark:text-white"
                      >
                        {sidePanelOption.option
                          .getCreatedAtFormatted()
                          .getDate()}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-zinc-500">
                        {sidePanelOption.option
                          .getCreatedAtFormatted()
                          .getTime()}
                      </p>
                    </div>
                  </div>
                  {sidePanelOption.state !== StakingState.Available && (
                    <div className="w-full h-[1px] w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
                  )}
                  {sidePanelOption.state == StakingState.Locked && (
                    <>
                      <div className="grid grid-cols-[160px,1fr] text-sm items-center h-[54px]">
                        <p className="text-gray-400 dark:text-zinc-500">
                          Lock time
                        </p>
                        <div>
                          <p
                            className="dark:text-white"
                            id={"sidePanel-lockTime"}
                          >
                            {getFormattedPeriod(
                              sidePanelOption?.option.getLockTimeInMonths(),
                              true,
                            )}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  {sidePanelOption.state === StakingState.Unlocking && (
                    <div className="grid grid-cols-[160px,1fr] text-sm items-center h-[54px]">
                      <p className="text-gray-400 dark:text-zinc-500">
                        Unlock date
                      </p>
                      {sidePanelOption.option.getUnlockIn() && (
                        <div>
                          <p className="dark:text-white">
                            {sidePanelOption.option
                              .getUnlockInFormatted()!
                              .getDate()}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-zinc-500">
                            {sidePanelOption.option
                              .getUnlockInFormatted()!
                              .getTime()}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  {}
                  <div className="w-full h-[1px] w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
                  <Button
                    id={"sidePanel-lock_unlock_Button"}
                    icon={
                      isLoading ? (
                        <Spinner className="w-5 h-5 text-gray-300 dark:text-white" />
                      ) : null
                    }
                    disabled={isLoading}
                    onClick={
                      sidePanelOption.state === StakingState.Unlocking
                        ? stopUnlocking
                        : sidePanelOption.state === StakingState.Locked
                          ? startUnlocking
                          : openRedeemModal
                    }
                    className={clsx("w-full mt-[20px]")}
                    type={
                      sidePanelOption.state === StakingState.Available
                        ? "primary"
                        : "stroke"
                    }
                  >
                    {sidePanelOption.state === StakingState.Unlocking
                      ? "Stop unlocking"
                      : sidePanelOption.state === StakingState.Locked
                        ? "Start unlocking"
                        : "Redeem stake"}
                  </Button>
                </div>
                {followees && (
                  <div className="border border-gray-200 dark:border-zinc-700 rounded-3xl px-[30px] py-[20px] relative mt-[20px]">
                    <div
                      className="flex items-center justify-between transition-all cursor-pointer group"
                      onClick={() => setIsStakingDelegatesOpen(true)}
                    >
                      <p className="dark:text-white">Voting delegates</p>
                      <div className="inline-flex items-center justify-between gap-1 cursor-pointer">
                        <IconCaret color={isDarkTheme ? "white" : "black"} />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
