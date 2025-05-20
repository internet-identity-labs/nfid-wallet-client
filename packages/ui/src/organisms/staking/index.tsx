import clsx from "clsx"
import { FC } from "react"
import { NavigateFunction } from "react-router-dom"

import { StakedToken } from "frontend/integration/staking/staked-token"
import { TotalBalance } from "frontend/integration/staking/types"

import DiamondIcon from "./assets/diamond.svg"
import EmptyStaking from "./assets/empty-staking.png"

import { IconNftPlaceholder } from "../../atoms/icons"
import { IconCaret } from "../../atoms/icons/caret"
import ImageWithFallback from "../../atoms/image-with-fallback"
import ProfileContainer from "../../atoms/profile-container/Container"
import { TableActivitySkeleton } from "../../atoms/skeleton"
import { StakingHeaderSkeleton } from "../../atoms/skeleton/staking-header"
import { Button } from "../../molecules/button"
import { Table } from "../../molecules/table"
import { StakingHeader } from "./components/staking-header"

export interface StakingProps {
  stakedTokens: StakedToken[]
  isLoading: boolean
  links: {
    base: string
    staking: string
  }
  navigate: NavigateFunction
  totalBalances?: TotalBalance
  onStakeClick: () => void
}

export const Staking: FC<StakingProps> = ({
  stakedTokens,
  isLoading,
  links,
  navigate,
  totalBalances,
  onStakeClick,
}) => {
  return (
    <>
      {isLoading ? (
        <StakingHeaderSkeleton />
      ) : (
        <StakingHeader
          total={totalBalances?.total}
          staked={totalBalances?.staked}
          rewards={totalBalances?.rewards}
          symbol="USD"
        />
      )}

      <ProfileContainer innerClassName="!px-0">
        <div
          className={clsx("overflow-auto", isLoading && "pl-5 sm:pl-[30px]")}
        >
          <Table className="!min-w-0" id="staking-table">
            {isLoading ? (
              <TableActivitySkeleton tableRowsAmount={3} tableCellAmount={3} />
            ) : stakedTokens.length ? (
              <>
                <tr className="hidden md:table-row">
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
                {stakedTokens.map((stakedToken) => {
                  return (
                    <tr
                      className="text-sm hover:bg-gray-50 h-[64px] transition-all group cursor-pointer"
                      key={stakedToken.getToken().getTokenAddress()}
                      onClick={() =>
                        navigate(
                          `${links.base}/${links.staking}/${stakedToken
                            .getToken()
                            .getTokenSymbol()}`,
                        )
                      }
                    >
                      <td className="md:pl-[30px]">
                        <div className="flex items-center gap-[12px]">
                          <div className="w-[40px] h-[40px] rounded-full bg-zinc-50 relative">
                            <ImageWithFallback
                              alt={stakedToken.getToken().getTokenSymbol()}
                              fallbackSrc={IconNftPlaceholder}
                              src={stakedToken.getToken().getTokenLogo()}
                              className={clsx(
                                "w-full h-full",
                                "rounded-full object-cover min-w-[24px] md:min-w-[40px]",
                              )}
                            />
                            {stakedToken.isDiamond() && (
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
                              {stakedToken.getToken().getTokenSymbol()}
                            </p>
                            <p className="text-secondary text-xs leading-[20px]">
                              {stakedToken.getToken().getTokenName()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="flex flex-col ml-auto h-[64px] justify-center w-max md:table-cell text-right md:text-left">
                        <p className="text-sm leading-6">
                          {stakedToken.getStakedFormatted().getTokenValue()}{" "}
                          {stakedToken.getToken().getTokenSymbol()}
                        </p>
                        <p className="text-xs leading-5 text-secondary">
                          {stakedToken.getStakedFormatted().getUSDValue()}
                        </p>
                      </td>
                      <td className="px-0 md:px-[30px] hidden md:table-cell">
                        <p className="text-sm leading-6">
                          {stakedToken.getRewardsFormatted().getTokenValue()}{" "}
                          {stakedToken.getToken().getTokenSymbol()}
                        </p>
                        <p className="text-xs leading-5 text-secondary">
                          {stakedToken.getRewardsFormatted().getUSDValue()}
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
            ) : (
              <ProfileContainer
                className="md:h-[360px] md:flex md:items-center !p-0 !border-0 !mb-0"
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
                  Stake your tokens to collect rewards for participating in
                  governance and helping to decentralize Web3 ecosystems.
                </p>
                <Button onClick={onStakeClick} className="w-full md:w-[120px]">
                  Stake
                </Button>
              </ProfileContainer>
            )}
          </Table>
        </div>
      </ProfileContainer>
    </>
  )
}
