import { useActor } from "@xstate/react"
import clsx from "clsx"
import ProfileInfo from "packages/ui/src/organisms/profile-info"
import {
  HTMLAttributes,
  useMemo,
  useCallback,
  ReactNode,
  FC,
  useContext,
} from "react"
import useSWR from "swr"

import { ArrowButton, Tooltip } from "@nfid-frontend/ui"
import { sendReceiveTracking } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

import { SendReceiveButton } from "frontend/apps/identity-manager/profile/send-receive-button"
import { useAllToken } from "frontend/features/fungible-token/use-all-token"
import { TransferModalCoordinator } from "frontend/features/transfer-modal/coordinator"
import { useAccountsOptions } from "frontend/features/transfer-modal/hooks/use-accounts-options"
import { getWalletDelegationAdapter } from "frontend/integration/adapters/delegations"
import { ProfileContext } from "frontend/provider"
import { Loader } from "frontend/ui/atoms/loader"
import { Blockchain } from "frontend/ui/connnector/types"
import ProfileHeader from "frontend/ui/organisms/profile-header"
import ProfileSidebar from "frontend/ui/organisms/profile-sidebar"

interface IProfileTemplate extends HTMLAttributes<HTMLDivElement> {
  pageTitle?: string
  icon?: string
  showBackButton?: boolean
  onIconClick?: () => void
  headerClassName?: string
  containerClassName?: string
  isLoading?: boolean
  headerMenu?: ReactNode
  iconTooltip?: string
  iconId?: string
  className?: string
}

const ProfileTemplate: FC<IProfileTemplate> = ({
  pageTitle,
  icon,
  showBackButton,
  onIconClick,
  children,
  className,
  headerClassName,
  containerClassName,
  isLoading = false,
  headerMenu,
  iconTooltip,
  iconId,
}) => {
  const handleNavigateBack = useCallback(() => {
    window.history.back()
  }, [])

  const globalServices = useContext(ProfileContext)
  const { token, isLoading: isTokenLoading } = useAllToken()
  const [, send] = useActor(globalServices.transferService)
  const {
    data: identity,
    isLoading: isIdentityLoading,
    isValidating,
  } = useSWR("globalIdentity", () =>
    getWalletDelegationAdapter("nfid.one", "-1"),
  )

  const onSendClick = () => {
    sendReceiveTracking.openModal()
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send("SHOW")
  }

  const onReceiveClick = () => {
    sendReceiveTracking.openModal()
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: "receive" })
    send("SHOW")
  }

  const tokensUsdValue = useMemo(() => {
    return token
      .filter((token) => token.rate)
      .reduce((total, token) => {
        return (
          total + (Number(token.balance) / 10 ** token.decimals) * token.rate!
        )
      }, 0)

    // Will add NFT floor price to calculation later!
  }, [token])

  if (!identity) return <Loader isLoading />

  return (
    <div className={clsx("relative min-h-screen overflow-hidden", className)}>
      <ProfileHeader className={clsx("px-4 sm:px-[30px]", headerClassName)} />
      <TransferModalCoordinator />
      <div
        className={clsx(
          "h-[calc(100vh-70px)] relative z-1 px-4",
          "sm:gap-[30px] sm:px-[30px]",
          "md:grid md:grid-cols-[50px,1fr]",
          "lg:grid-cols-[256px,1fr]",
          "overflow-auto",
          containerClassName,
        )}
      >
        <div className={clsx("hidden mt-5 -ml-3 md:block relative")}>
          <ProfileSidebar id="desktop" />
        </div>
        <section className={clsx("relative", className)}>
          <ProfileInfo
            value={tokensUsdValue}
            isLoading={isTokenLoading && isIdentityLoading && isValidating}
            onSendClick={onSendClick}
            onReceiveClick={onReceiveClick}
            address={identity.getPrincipal().toString()}
          />
          <div className="flex justify-between h-[70px] items-center mt-5">
            <div className="sticky left-0 flex items-center space-x-2">
              {showBackButton && (
                <ArrowButton
                  onClick={handleNavigateBack}
                  iconClassName="text-black"
                />
              )}
              <p className="text-[28px] block" id={"page_title"}>
                {pageTitle}
              </p>
            </div>
            {icon && onIconClick && (
              <Tooltip tip={iconTooltip}>
                <img
                  id={iconId}
                  src={icon}
                  alt="icon"
                  onClick={onIconClick}
                  className="w-6 h-6 transition-all cursor-pointer hover:opacity-70"
                />
              </Tooltip>
            )}
            {headerMenu}
          </div>
          {children}
        </section>
      </div>
      <Loader isLoading={isLoading} />
    </div>
  )
}

export default ProfileTemplate
