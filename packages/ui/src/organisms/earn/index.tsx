import clsx from "clsx"
import { FC, useContext } from "react"
import { NavigateFunction } from "react-router-dom"

import { useDarkTheme } from "frontend/hooks"

import { IconCaret } from "../../atoms/icons/caret"
import ProfileContainer from "../../atoms/profile-container/Container"
import { TableActivitySkeleton } from "../../atoms/skeleton"
import { Button } from "../../molecules/button"
import { Table } from "../../molecules/table"
import { EarnHeader } from "./components/earn-header"
import {
  AaveUserPosition,
  WRAPPED_NATIVE_TOKEN,
} from "frontend/integration/aave"
import { EVM_NATIVE, ETH_NATIVE_ID } from "@nfid/integration/token/constants"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { EarnHeaderSkeleton } from "../../atoms/skeleton/earn-header"
import { TokenIdentity } from "../tokens/components/token-identity"
import { FT } from "frontend/integration/ft/ft"
import EmptyEarn from "./assets/empty-earn.png"
import { SelectedToken } from "frontend/features/transfer-modal/types"
import { getIsMobileDeviceMatch } from "../../utils/is-mobile"
import { ProfileContext } from "frontend/provider"

export interface EarnProps {
  earnPositions?: AaveUserPosition[]
  tokens?: FT[]
  isLoading: boolean
  links: {
    base: string
    earn: string
  }
  navigate: NavigateFunction
  totalBalance?: string
  onEarnClick?: (selectedToken?: SelectedToken) => void
  onWithdrawClick?: (selectedToken: SelectedToken, balance: bigint) => void
}

export const Earn: FC<EarnProps> = ({
  earnPositions,
  tokens,
  isLoading,
  links,
  navigate,
  totalBalance,
  onEarnClick,
  onWithdrawClick,
}) => {
  const isDarkTheme = useDarkTheme()
  const isMobile = getIsMobileDeviceMatch()
  const { isViewOnlyMode } = useContext(ProfileContext)

  return (
    <>
      {isLoading || !earnPositions ? (
        <EarnHeaderSkeleton />
      ) : (
        earnPositions &&
        earnPositions.length > 0 && <EarnHeader value={totalBalance} />
      )}
      <ProfileContainer innerClassName="!px-0">
        <div
          className={clsx((isLoading || !earnPositions) && "pl-5 sm:pl-[30px]")}
        >
          <Table className="!min-w-0" id="staking-table">
            {isLoading || !earnPositions ? (
              <TableActivitySkeleton tableRowsAmount={3} tableCellAmount={3} />
            ) : earnPositions && earnPositions.length ? (
              <>
                <tr className="hidden md:table-row dark:text-zinc-500">
                  <td
                    className={clsx(
                      "pb-[10px] text-sm font-bold text-gray-400 dark:text-zinc-500",
                      "px-0 md:px-[30px] min-w-[230px] w-[100%] md:w-auto lg:w-[40%]",
                    )}
                  >
                    Token
                  </td>
                  <td
                    className={clsx(
                      "pb-[10px] text-sm font-bold text-gray-400 dark:text-zinc-500",
                      "px-0 md:px-[30px] w-[290px]",
                    )}
                  >
                    Supplied
                  </td>
                  <td
                    className={clsx(
                      "pb-[10px] text-sm font-bold text-gray-400 dark:text-zinc-500",
                      "px-0 w-[120px] px-[10px]",
                    )}
                  >
                    APY
                  </td>
                  {!isViewOnlyMode && (
                    <td className="w-[172px] hidden md:table-cell" />
                  )}
                </tr>
                {tokens &&
                  earnPositions.map((position) => {
                    const token = tokens.find((t) => {
                      if (
                        WRAPPED_NATIVE_TOKEN[position.chainId].toLowerCase() ===
                        position.asset
                      ) {
                        const nativeId =
                          position.chainId === ChainId.ETH
                            ? ETH_NATIVE_ID
                            : EVM_NATIVE
                        return (
                          t.getTokenAddress() === nativeId &&
                          t.getChainId() === position.chainId
                        )
                      } else {
                        return (
                          t.getTokenAddress().toLowerCase() ===
                            position.asset &&
                          t.getChainId() === position.chainId
                        )
                      }
                    })!

                    return (
                      <tr
                        className="text-sm h-[64px]"
                        id={`earnPosition_${position.asset}_${position.chainId}_${position.symbol}`}
                        key={`earnPosition_${position.asset}_${position.chainId}_${position.symbol}`}
                        onClick={() => {
                          if (!isMobile) return
                          navigate(
                            `${links.base}/${links.earn}/${position.chainId}/${position.asset}`,
                          )
                        }}
                      >
                        <td className="md:pl-[30px] w-[100%] md:w-auto lg:w-[40%]">
                          <div className="flex items-center gap-[12px]">
                            <TokenIdentity token={token} />
                          </div>
                        </td>
                        <td className="px-0 md:px-[30px] whitespace-nowrap">
                          <p
                            id={"tokenEarned"}
                            className="text-sm leading-6 dark:text-white"
                          >
                            {position.balanceFormatted}
                          </p>
                          <p className="text-xs leading-5 text-secondary dark:text-zinc-500">
                            {position.balanceUsdFormatted}
                          </p>
                        </td>
                        <td className="px-0 hidden md:table-cell max-w-[120px] w-[120px] px-[10px]">
                          <p
                            id={"tokenRewards"}
                            className="text-sm leading-6 dark:text-white"
                          >
                            {position.supplyAPY}
                          </p>
                        </td>
                        {!isViewOnlyMode && (
                          <td className="text-right w-[172px] md:text-left hidden md:table-cell pr-[30px]">
                            <div className="flex items-center justify-end gap-2.5">
                              <Button
                                onClick={() =>
                                  onEarnClick?.({
                                    address: token.getTokenAddress(),
                                    chainId: token.getChainId(),
                                  })
                                }
                                type="stroke"
                                className="w-auto px-[13px]"
                              >
                                Supply
                              </Button>
                              <Button
                                onClick={() =>
                                  onWithdrawClick?.(
                                    {
                                      address: token.getTokenAddress(),
                                      chainId: token.getChainId(),
                                    },
                                    position.balance,
                                  )
                                }
                                type="stroke"
                                className="w-auto px-[13px]"
                              >
                                Withdraw
                              </Button>
                            </div>
                          </td>
                        )}
                        <td className="w-[34px] min-w-[34px] text-right md:text-left md:hidden">
                          <div
                            id={"earnDetailsButton"}
                            className="inline-flex items-center justify-between gap-1"
                          >
                            <IconCaret
                              color={isDarkTheme ? "#71717A" : "#9CA3AF"}
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
              </>
            ) : (
              <ProfileContainer
                innerClassName="md:max-w-[50%]"
                className="md:h-[360px] md:flex md:items-center !p-0 !border-0 !mb-0"
                titleClassName="!px-0"
              >
                <img
                  className={clsx(
                    "w-[100vw] max-w-[500px] right-[-1rem] mx-auto",
                    "sm:right-[30px] mb-[20px] md:w-[40vw] top-0",
                    "md:absolute md:mb-0",
                  )}
                  src={EmptyEarn}
                />
                {onEarnClick && (
                  <>
                    <p className="leading-[18px] mb-[20px] text-sm md:max-w-[400px] lg:max-w-[460px] dark:text-zinc-500">
                      Put your crypto to work. Supply assets to start earning
                      yield automatically.
                    </p>
                    <Button
                      onClick={() => onEarnClick()}
                      className="w-full md:w-[120px]"
                    >
                      Supply
                    </Button>
                  </>
                )}
              </ProfileContainer>
            )}
          </Table>
        </div>
      </ProfileContainer>
    </>
  )
}
