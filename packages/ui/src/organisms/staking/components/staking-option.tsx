import clsx from "clsx"
import { A } from "packages/ui/src/atoms/custom-link"
import { IconInfo, IconNftPlaceholder } from "packages/ui/src/atoms/icons"
import { IconCaret } from "packages/ui/src/atoms/icons/caret"
import ImageWithFallback from "packages/ui/src/atoms/image-with-fallback"
import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
import CopyAddress from "packages/ui/src/molecules/copy-address"
import { Table } from "packages/ui/src/molecules/table"
import { Tooltip } from "packages/ui/src/molecules/tooltip"
import { FC } from "react"

import { NFIDNeuron } from "frontend/integration/staking/nfid-neuron"
import { StakingState } from "frontend/integration/staking/types"

import { getFormattedPeriod } from "../../send-receive/utils"
import DiamondIcon from "../assets/diamond.svg"
import { SidePanelOption } from "./staking-side-panel"

export interface StakingOptionProps {
  stakingState: StakingState
  stakes: NFIDNeuron[]
  symbol: string
  setSidePanelOption: (option: SidePanelOption) => void
}

export const StakingOption: FC<StakingOptionProps> = ({
  stakes,
  stakingState,
  symbol,
  setSidePanelOption,
}) => {
  return (
    <ProfileContainer
      id={`stakingDetails-${stakingState}-table`}
      title={stakingState}
      className="!py-[20px] md:!py-[30px] !mb-[20px] md:!mb-[30px]"
      titleClassName="!px-0 md:!px-[30px] mb-[10px] md:!mb-[30px]"
      innerClassName="!px-0"
    >
      <Table className="!min-w-0 table-fixed w-full" id="staking-table">
        <tr className="hidden md:table-row">
          <td
            className={clsx(
              "pb-[10px] text-sm font-bold text-gray-400",
              "px-0 md:px-[30px]",
              "w-[35%]",
            )}
          >
            <div className="flex items-center gap-1">
              Stake ID
              <Tooltip
                align="end"
                alignOffset={-20}
                tip={
                  <span className="block max-w-[300px]">
                    Stake IDs are synonymous to “neuron IDs” in other systems
                    like the NNS.
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
          </td>
          <td
            className={clsx(
              "pb-[10px] text-sm font-bold text-gray-400",
              "w-[15%]",
            )}
          >
            Initial stake
          </td>
          <td
            className={clsx(
              "pb-[10px] text-sm font-bold text-gray-400",
              "px-0 md:px-[10px] w-[15%]",
            )}
          >
            <div className="flex items-center gap-1">
              Rewards
              <Tooltip
                align="end"
                alignOffset={-20}
                tip={
                  <>
                    <span className="block max-w-[300px] mb-4">
                      Rewards are earned in “maturity”, which will convert to{" "}
                      {symbol} at the time of stake withdrawal.
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
          </td>
          <td
            className={clsx(
              "pb-[10px] text-sm font-bold text-gray-400",
              "px-0 md:px-[10px] w-[15%]",
            )}
          >
            {stakingState === StakingState.Unlocking
              ? "Unlock in"
              : "Lock time"}
          </td>
          <td className={clsx("w-[55px]")} />
        </tr>
        {stakes.map((stake) => {
          return (
            <tr
              id={
                `stakedTokenTransaction_${stake
                  .getToken()
                  .getTokenName()
                  .replace(/\s+/g, "")}`
              }
              className="text-sm md:hover:bg-gray-50 h-[64px] transition-all group cursor-pointer"
              key={stake.getStakeIdFormatted()}
              onClick={() =>
                setSidePanelOption({ option: stake, state: stakingState })
              }
            >
              <td className="md:pl-[30px]">
                <div className="flex items-center gap-[12px]">
                  <div className="w-[40px] h-[40px] rounded-full bg-zinc-50 relative">
                    <ImageWithFallback
                      alt={stake.getToken().getTokenSymbol()}
                      fallbackSrc={IconNftPlaceholder}
                      src={stake.getToken().getTokenLogo()}
                      className={clsx(
                        "w-full h-full",
                        "rounded-full object-cover min-w-[24px] md:min-w-[40px]",
                      )}
                    />
                    {stake.isDiamond() && (
                      <div
                        className={clsx(
                          "absolute bottom-0 right-0 rounded-full",
                          "flex items-center justify-center w-5 h-5 bg-white",
                        )}
                      >
                        <img src={DiamondIcon} />
                      </div>
                    )}
                  </div>
                  <div>
                    <p
                      id={"token"}
                      className="text-sm leading-[20px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CopyAddress
                        address={stake.getStakeIdFormatted()}
                        leadingChars={6}
                        trailingChars={4}
                      />
                    </p>
                  </div>
                </div>
              </td>
              <td className="flex flex-col ml-auto h-[64px] justify-center w-max md:table-cell text-right md:text-left">
                <p id={"tokenInitialStake"} className="text-sm leading-6">
                  {stake.getInitialStakeFormatted().getTokenValue()}
                </p>
                <p className="text-xs leading-5 text-secondary">
                  {stake.getInitialStakeFormatted().getUSDValue()}
                </p>
              </td>
              <td className="px-0 md:px-[10px] hidden md:table-cell">
                <p id={"tokenRewards"} className="text-sm leading-6">
                  {stake.getRewardsFormatted().getTokenValue()}
                </p>
                <p className="text-xs leading-5 text-secondary">
                  {stake.getRewardsFormatted().getUSDValue()}
                </p>
              </td>
              <td className="px-0 md:px-[10px] hidden md:table-cell">
                <p
                  className="text-sm leading-5 opacity-80"
                  id={stakingState === StakingState.Unlocking
                    ? "tokenUnlockTime"
                    : "tokenLockTime"
                  }
                >
                  {stakingState === StakingState.Unlocking
                    ? stake.getUnlockInMonths()
                    : getFormattedPeriod(stake.getLockTimeInMonths(), true)}
                </p>
              </td>
              <td
                className={clsx(
                  "w-[34px] md:w-[55px] text-right pr-0 md:pr-[30px]",
                )}
              >
                <div
                  id={"tokenTransactionDetailsButton"}
                  className="inline-flex items-center justify-between gap-1 cursor-pointer"
                >
                  <IconCaret />
                </div>
              </td>
            </tr>
          )
        })}
      </Table>
    </ProfileContainer>
  )
}
