/* eslint-disable @nx/enforce-module-boundaries */
import { FC, memo } from "react"
import { NotFound } from "@nfid-frontend/ui"

import { useNavigate } from "react-router-dom"
import { VaultPortfolioProps } from "../types"
import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
import { Tokens } from "../../tokens"
import { VaultSkeleton } from "packages/ui/src/atoms/skeleton/vault-skeleton"
import { Balance } from "../../profile-info/balance"

export const VaultPortfolio: FC<VaultPortfolioProps> = memo(
  ({
    tokens,
    allTokens,
    isLoading,
    isTokensLoading,
    vault,
    updateVault,
    isUsdLoading,
    usdBalance,
  }) => {
    //if (!vault) return <NotFound hideNavigation />

    console.log("tokenzz", vault)

    return (
      <>
        <ProfileContainer
          className="!py-[20px] md:!py-[30px] !border !mb-[20px] md:!mb-[30px] dark:text-white"
          innerClassName="!px-[20px] md:!px-[30px]"
        >
          <div className="flex items-center gap-[20px] sm:gap-[40px] md:gap-[80px] lg:gap-[120px] flex-wrap">
            <div>
              <p className="mb-5 text-sm font-bold leading-5 text-secondary dark:text-zinc-500">
                Known token value
              </p>
              <Balance
                id={"totalBalance"}
                isLoading={isUsdLoading || isLoading || isTokensLoading}
                usdBalance={usdBalance}
              />
            </div>
          </div>
        </ProfileContainer>
        <ProfileContainer
          title="Tokens"
          titleClassName="sm:px-[30px] leading-[54px] mb-[22px]"
          className="!py-[20px] md:!py-[30px] !border !mb-[20px] md:!mb-[30px] dark:text-white"
          innerClassName="!px-[20px] md:!px-[30px]"
        >
          <Tokens
            initedTokens={tokens!}
            allTokens={allTokens}
            isTokensLoading={isTokensLoading}
            isVault={true}
            updateVault={updateVault}
          />
        </ProfileContainer>
      </>
    )
  },
)
