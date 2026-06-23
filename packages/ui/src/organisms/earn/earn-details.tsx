import clsx from "clsx"
import { FC, useCallback, useContext } from "react"

import { NotFound } from "../../pages/404"
import { ArrowButton } from "../../molecules/button/arrow-button"
import { AaveUserPosition } from "frontend/integration/aave"
import { FT } from "frontend/integration/ft/ft"
import ImageWithFallback from "../../atoms/image-with-fallback"
import { IconNftPlaceholder } from "../../atoms/icons"
import { useDarkTheme } from "frontend/hooks"
import { getNetworkIcon } from "../../utils/network-icon"
import ProfileContainer from "../../atoms/profile-container/Container"
import { Button } from "../../molecules/button"
import { ProfileContext } from "frontend/provider"

export interface EarnDetailsProps {
  earnPosition?: AaveUserPosition
  isLoading: boolean
  onSupply: () => void
  onWithdraw: () => void
  token?: FT
}

export const EarnDetails: FC<EarnDetailsProps> = ({
  earnPosition,
  isLoading,
  onSupply,
  onWithdraw,
  token,
}) => {
  const handleNavigateBack = useCallback(() => {
    window.history.back()
  }, [])
  const isDarkTheme = useDarkTheme()
  const { isViewOnlyMode } = useContext(ProfileContext)

  if ((!earnPosition && !isLoading) || !token)
    return <NotFound hideNavigation />

  return (
    <>
      <div className="flex gap-[10px] items-center mb-5">
        <ArrowButton
          buttonClassName="py-[7px] dark:hover:bg-zinc-700"
          onClick={handleNavigateBack}
          iconClassName="text-black dark:text-white"
        />
        <div className="relative">
          <ImageWithFallback
            alt={`${token.getTokenSymbol()}`}
            fallbackSrc={IconNftPlaceholder}
            src={token.getTokenLogo()}
            className={clsx("w-[60px] h-[60px]", "rounded-full object-cover")}
          />
          <div className="absolute bottom-0 right-0 w-[27px] h-[27px] rounded-[9px] bg-white dark:bg-zinc-800 [&>svg]:w-full [&>svg]:h-full">
            {getNetworkIcon(token.getChainId(), isDarkTheme)}
          </div>
        </div>

        <div>
          <p className="text-[28px] leading-[36px] dark:text-white">
            {token.getTokenSymbol()}
          </p>
          <p className="text-xs leading-5 text-secondary dark:text-zinc-500">
            {token.getTokenName()}
          </p>
        </div>
      </div>
      <ProfileContainer
        innerClassName="!px-[20px]"
        className="!border"
        titleClassName="dark:text-white mt-4"
        title="Earning details"
      >
        <div className="grid grid-cols-[110px,1fr] text-sm items-center h-[54px]">
          <div className="flex items-center gap-1">
            <p className="text-gray-400 dark:text-zinc-500">Supplied</p>
          </div>
          <div>
            <p className="dark:text-white">{earnPosition?.balanceFormatted}</p>
            <p className="text-xs text-gray-400 dark:text-zinc-500">
              {earnPosition?.balanceUsdFormatted}
            </p>
          </div>
        </div>
        <div className="w-full h-[1px] w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
        <div className="grid grid-cols-[110px,1fr] text-sm items-center h-[54px]">
          <div className="flex items-center gap-1">
            <p className="text-gray-400 dark:text-zinc-500">APY</p>
          </div>
          <p className="dark:text-white">{earnPosition?.supplyAPY}</p>
        </div>
        {!isViewOnlyMode && (
          <div className="my-5 flex gap-2.5">
            <Button onClick={onSupply} type="stroke" className="w-full">
              Supply
            </Button>
            <Button onClick={onWithdraw} type="stroke" className="w-full">
              Withdraw
            </Button>
          </div>
        )}
      </ProfileContainer>
    </>
  )
}
