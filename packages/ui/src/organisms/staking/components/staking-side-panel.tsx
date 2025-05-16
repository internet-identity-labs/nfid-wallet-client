import { SignIdentity } from "@dfinity/agent"
import clsx from "clsx"
import { motion } from "framer-motion"
import { resetIntegrationCache } from "packages/integration/src/cache"
import { A } from "packages/ui/src/atoms/custom-link"
import { IconInfo } from "packages/ui/src/atoms/icons"
import { IconCaret } from "packages/ui/src/atoms/icons/caret"
import { Spinner } from "packages/ui/src/atoms/spinner"
import { Button } from "packages/ui/src/molecules/button"
import { ArrowButton } from "packages/ui/src/molecules/button/arrow-button"
import CopyAddress from "packages/ui/src/molecules/copy-address"
import { useDisableScroll } from "packages/ui/src/molecules/modal/hooks/disable-scroll"
import { Tooltip } from "packages/ui/src/molecules/tooltip"
import { FC, useState } from "react"

import { mutate } from "@nfid/swr"

import { NFIDNeuron } from "frontend/integration/staking/nfid-neuron"
import { StakingState } from "frontend/integration/staking/types"

import { getFormattedPeriod } from "../../send-receive/utils"

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
  isLoading: boolean
  setIsLoading: (v: boolean) => void
}

export const StakingSidePanel: FC<StakingSidePanelProps> = ({
  isOpen,
  onClose,
  sidePanelOption,
  onRedeemOpen,
  identity,
  isLoading,
  setIsLoading,
}) => {
  const [isVotingOpen, setIsVotingOpen] = useState(false)
  useDisableScroll(isOpen)

  const symbol = sidePanelOption?.option.getToken().getTokenSymbol()

  const openRedeemModal = async () => {
    const id = sidePanelOption?.option.getStakeIdFormatted()
    if (!id) return

    onRedeemOpen(id)
    onClose()
  }

  const stopUnlocking = () => {
    if (!identity) return
    setIsLoading(true)
    resetIntegrationCache(["getStakedTokens"])
    sidePanelOption?.option.stopUnlocking(identity).then(async () => {
      await mutate(["stakedToken", symbol])
      onClose()
      setIsLoading(false)
    })
  }

  const startUnlocking = async () => {
    if (!identity) return
    setIsLoading(true)
    resetIntegrationCache(["getStakedTokens"])
    sidePanelOption?.option.startUnlocking(identity).then(async () => {
      await mutate(["stakedToken", symbol])
      onClose()
      setIsLoading(false)
    })
  }

  return (
    <div>
      <div
        onClick={() => (isVotingOpen ? setIsVotingOpen(false) : onClose())}
        className={clsx(
          "fixed inset-0 z-50 left-0 top-0",
          "w-screen h-screen",
          !isOpen && "hidden",
        )}
      />
      <div
        className={clsx(
          "w-[90vw] md:w-[600px] h-screen fixed top-0 right-0 transition-all duration-500",
          "bg-white shadow-[0px_4px_40px_rgba(0,0,0,0.2)] z-[52] transform p-[30px] overflow-auto",
          !isOpen ? "translate-x-[800px]" : "translate-x-0",
        )}
      >
        {!sidePanelOption ? null : (
          <>
            <div className="flex items-center justify-between h-[70px]">
              <div className="flex space-x-2.5 items-center">
                <ArrowButton
                  buttonClassName="py-[7px]"
                  onClick={() =>
                    isVotingOpen ? setIsVotingOpen(false) : onClose()
                  }
                  iconClassName="text-black"
                />
                <p className="text-[28px]">
                  {isVotingOpen ? "Voting delegates" : "Staking details"}
                </p>
              </div>
              {!isVotingOpen && (
                <p className="text-sm text-right text-secondary">
                  {sidePanelOption.state}
                </p>
              )}
            </div>
            {isVotingOpen && (
              <div className="mb-[20px]">
                The below delegates are voting on your behalf. Use Toolkit IC to
                change your delegates or vote manually.
              </div>
            )}
            {isVotingOpen ? (
              <motion.div
                key="VotingPanel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="border border-gray-200 rounded-3xl px-[30px] py-[20px] relative">
                  <div>
                    <div className="flex justify-between text-sm items-center h-[54px]">
                      <p className="text-gray-400">Governance</p>
                      <div>
                        <CopyAddress
                          address={sidePanelOption.option.getStakeIdFormatted()}
                          trailingChars={4}
                          leadingChars={6}
                        />
                      </div>
                    </div>
                    <div className="w-full h-[1px] w-full h-[1px] bg-gray-200" />
                    <div className="flex justify-between text-sm items-center h-[54px]">
                      <p className="text-gray-400">Participant management</p>
                      <div>
                        <CopyAddress
                          address={sidePanelOption.option.getStakeIdFormatted()}
                          trailingChars={4}
                          leadingChars={6}
                        />
                      </div>
                    </div>
                    <div className="w-full h-[1px] w-full h-[1px] bg-gray-200" />
                    <div className="flex justify-between text-sm items-center h-[54px]">
                      <p className="text-gray-400">SNS & Neurons’ fund</p>
                      <div>
                        <CopyAddress
                          address={sidePanelOption.option.getStakeIdFormatted()}
                          trailingChars={4}
                          leadingChars={6}
                        />
                      </div>
                    </div>
                    <div className="w-full h-[1px] w-full h-[1px] bg-gray-200" />
                    <div className="flex justify-between text-sm items-center h-[54px]">
                      <p className="text-gray-400">Transaction fee</p>
                      <div>
                        <CopyAddress
                          address={sidePanelOption.option.getStakeIdFormatted()}
                          trailingChars={4}
                          leadingChars={6}
                        />
                      </div>
                    </div>
                    <div className="w-full h-[1px] w-full h-[1px] bg-gray-200" />
                    <div className="flex justify-between text-sm items-center h-[54px]">
                      <p className="text-gray-400">Network economics</p>
                      <div>
                        <CopyAddress
                          address={sidePanelOption.option.getStakeIdFormatted()}
                          trailingChars={4}
                          leadingChars={6}
                        />
                      </div>
                    </div>
                    <div className="w-full h-[1px] w-full h-[1px] bg-gray-200" />
                    <div className="flex justify-between text-sm items-center h-[54px]">
                      <p className="text-gray-400">Node admin</p>
                      <div>
                        <CopyAddress
                          address={sidePanelOption.option.getStakeIdFormatted()}
                          trailingChars={4}
                          leadingChars={6}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="StakingPanel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="border border-gray-200 rounded-3xl px-[30px] py-[20px] relative">
                  <div>
                    <div className="grid grid-cols-[160px,1fr] text-sm items-center h-[54px]">
                      <div className="flex items-center gap-1">
                        <p className="text-gray-400">Stake ID</p>
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
                            src={IconInfo}
                            alt="icon"
                            className="w-[20px] h-[20px] transition-all cursor-pointer hover:opacity-70"
                          />
                        </Tooltip>
                      </div>
                      <div>
                        <CopyAddress
                          address={sidePanelOption.option.getStakeIdFormatted()}
                          trailingChars={4}
                          leadingChars={6}
                        />
                      </div>
                    </div>
                    <div className="w-full h-[1px] w-full h-[1px] bg-gray-200" />
                    <div className="grid grid-cols-[160px,1fr] text-sm items-center h-[54px]">
                      <p className="text-gray-400">Initial stake</p>
                      <div>
                        <p>
                          {sidePanelOption.option
                            .getInitialStakeFormatted()
                            .getTokenValue()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {sidePanelOption.option
                            .getInitialStakeFormatted()
                            .getUSDValue()}
                        </p>
                      </div>
                    </div>
                    <div className="w-full h-[1px] w-full h-[1px] bg-gray-200" />
                    <div className="grid grid-cols-[160px,1fr] text-sm items-center h-[54px]">
                      <div className="flex items-center gap-1">
                        <p className="text-gray-400">Rewards</p>
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
                            src={IconInfo}
                            alt="icon"
                            className="w-[20px] h-[20px] transition-all cursor-pointer hover:opacity-70"
                          />
                        </Tooltip>
                      </div>
                      <div>
                        <p>
                          {sidePanelOption.option
                            .getRewardsFormatted()
                            .getTokenValue()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {sidePanelOption.option
                            .getRewardsFormatted()
                            .getUSDValue()}
                        </p>
                      </div>
                    </div>
                    <div className="w-full h-[1px] w-full h-[1px] bg-gray-200" />
                    <div className="grid grid-cols-[160px,1fr] text-sm items-center h-[54px]">
                      <div className="flex items-center gap-1">
                        <p className="text-gray-400">Total value</p>
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
                            src={IconInfo}
                            alt="icon"
                            className="w-[20px] h-[20px] transition-all cursor-pointer hover:opacity-70"
                          />
                        </Tooltip>
                      </div>
                      <div>
                        <p className="font-bold">
                          {sidePanelOption.option
                            .getTotalValueFormatted()
                            .getTokenValue()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {sidePanelOption.option
                            .getTotalValueFormatted()
                            .getUSDValue()}
                        </p>
                      </div>
                    </div>
                    <div className="w-full h-[1px] w-full h-[1px] bg-gray-200" />
                    <div className="grid grid-cols-[160px,1fr] text-sm items-center h-[54px]">
                      <p className="text-gray-400">Unlock in</p>
                      <div>
                        <p>{sidePanelOption.option.getUnlockIn()}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-3xl px-[30px] pb-[30px] pt-[16px] mt-5">
                  <div className="text-[24px] leading-[50px] mb-[10px]">
                    Details
                  </div>
                  <div className="grid grid-cols-[160px,1fr] text-sm items-center h-[54px]">
                    <p className="text-gray-400">Date created</p>
                    <div>
                      <p>
                        {sidePanelOption.option
                          .getCreatedAtFormatted()
                          .getDate()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {sidePanelOption.option
                          .getCreatedAtFormatted()
                          .getTime()}
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-[1px] w-full h-[1px] bg-gray-200" />
                  <div className="grid grid-cols-[160px,1fr] text-sm items-center h-[54px]">
                    <p className="text-gray-400">Lock time</p>
                    <div>
                      <p>
                        {getFormattedPeriod(
                          sidePanelOption?.option.getLockTimeInMonths(),
                          true,
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-[1px] w-full h-[1px] bg-gray-200" />
                  <div className="grid grid-cols-[160px,1fr] text-sm items-center h-[54px]">
                    <p className="text-gray-400">Unlock date</p>
                    {sidePanelOption.option.getUnlockIn() && (
                      <div>
                        <p>
                          {sidePanelOption.option
                            .getUnlockInFormatted()!
                            .getDate()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {sidePanelOption.option
                            .getUnlockInFormatted()!
                            .getTime()}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="w-full h-[1px] w-full h-[1px] bg-gray-200" />
                  <Button
                    icon={
                      isLoading ? (
                        <Spinner className="w-5 h-5 text-gray-300" />
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
                    className="w-full mt-[20px]"
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
                <div className="border border-gray-200 rounded-3xl px-[30px] py-[20px] relative mt-[20px]">
                  <div
                    className="flex items-center justify-between transition-all cursor-pointer group"
                    onClick={() => setIsVotingOpen(true)}
                  >
                    <p>Voting delegates</p>
                    <div className="inline-flex items-center justify-between gap-1 cursor-pointer">
                      <IconCaret />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
