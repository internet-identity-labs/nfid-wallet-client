import clsx from "clsx"
import { FC } from "react"
import { NavigateFunction } from "react-router-dom"

import { IStakingInfo, IStake } from "frontend/features/staking"

import DiamondIcon from "./assets/diamond.svg"
import EmptyStaking from "./assets/empty-staking.png"

import { IconNftPlaceholder } from "../../atoms/icons"
import { IconCaret } from "../../atoms/icons/caret"
import ImageWithFallback from "../../atoms/image-with-fallback"
import ProfileContainer from "../../atoms/profile-container/Container"
import { TableActivitySkeleton } from "../../atoms/skeleton"
import { Button } from "../../molecules/button"
import { Table } from "../../molecules/table"
import { StakingHeader } from "./components/staking-header"

export interface StakingProps {
  stakes: IStake[]
  isLoading: boolean
  links: {
    base: string
    staking: string
  }
  stakingInfo: IStakingInfo
  navigate: NavigateFunction
}

export const Staking: FC<StakingProps> = ({
  stakes,
  isLoading,
  links,
  stakingInfo,
  navigate,
}) => {
  return stakes.length ? (
    <>
      <StakingHeader stakingInfo={stakingInfo} />
      <ProfileContainer innerClassName="!px-0">
        <div
          className={clsx("overflow-auto", isLoading && "pl-5 sm:pl-[30px]")}
        >
          <Table className="!min-w-0" id="staking-table">
            {isLoading ? (
              <TableActivitySkeleton tableRowsAmount={10} tableCellAmount={3} />
            ) : (
              <>
                <tr id={`stake_1`} className="hidden md:table-row">
                  <td
                    className={clsx(
                      "pb-[10px] text-sm font-bold text-gray-400",
                      "px-0 md:px-[30px] min-w-[230px]",
                    )}
                  >
                    Token
                  </td>
                  <td
                    className={clsx(
                      "pb-[10px] text-sm font-bold text-gray-400",
                      "w-[230px]",
                    )}
                  >
                    Staked
                  </td>
                  <td
                    className={clsx(
                      "pb-[10px] text-sm font-bold text-gray-400",
                      "px-0 md:px-[30px] w-[290px]",
                    )}
                  >
                    Rewards
                  </td>
                  <td className="w-[55px]" />
                </tr>
                {stakes.map((stake) => {
                  return (
                    <tr
                      className="text-sm hover:bg-gray-50 h-[64px] transition-all group cursor-pointer"
                      key={stake.symbol}
                      onClick={() =>
                        navigate(
                          `${links.base}/${links.staking}/${stake.symbol}`,
                        )
                      }
                    >
                      <td className="md:pl-[30px]">
                        <div className="flex items-center gap-[12px]">
                          <div className="w-[40px] h-[40px] rounded-full bg-zinc-50 relative">
                            <ImageWithFallback
                              alt={stake.symbol}
                              fallbackSrc={IconNftPlaceholder}
                              src={stake.logo}
                              className={clsx(
                                "w-full h-full",
                                "rounded-full object-cover min-w-[24px] md:min-w-[40px]",
                              )}
                            />
                            {stake.isDiamond && (
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
                            <p className="text-sm font-semibold leading-[25px]">
                              {stake.symbol}
                            </p>
                            <p className="text-secondary text-xs leading-[20px]">
                              {stake.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="flex flex-col ml-auto h-[64px] justify-center w-max md:table-cell text-right md:text-left">
                        <p className="text-sm leading-6">{stake.staked}</p>
                        <p className="text-xs leading-5 text-secondary">
                          {stake.stakedInUsd}
                        </p>
                      </td>
                      <td className="px-0 md:px-[30px] hidden md:table-cell">
                        <p className="text-sm leading-6">{stake.rewards}</p>
                        <p className="text-xs leading-5 text-secondary">
                          {stake.rewardsInUsd}
                        </p>
                      </td>
                      <td className="w-[34px] text-right md:w-[55px] md:text-left">
                        <div className="inline-flex items-center justify-between gap-1">
                          <IconCaret />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </>
            )}
          </Table>
        </div>
      </ProfileContainer>
    </>
  ) : (
    <ProfileContainer
      className="md:h-[292px] md:flex md:items-center"
      titleClassName="!px-0"
    >
      <img
        className={clsx(
          "w-full mb-[20px]",
          "md:absolute md:w-[375px] md:right-[30px] md:top-[30px] md:mb-0",
          "lg:right-[70px]",
        )}
        src={EmptyStaking}
      />
      <p className="leading-[18px] mb-[20px] text-sm md:max-w-[400px] lg:max-w-[460px]">
        Stake your tokens to collect rewards for participating in governance and
        helping to decentralize Web3 ecosystems.
      </p>
      <Button className="w-full md:w-[120px]">Stake</Button>
    </ProfileContainer>
  )
}
