import { useActor } from "@xstate/react"
import clsx from "clsx"
import ProfileInfo from "packages/ui/src/organisms/profile-info"
import {
  HTMLAttributes,
  useCallback,
  ReactNode,
  FC,
  useMemo,
  useContext,
  useEffect,
} from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import useSWR from "swr"

import { ArrowButton, TabProps, TabsSwitcher, Tooltip } from "@nfid-frontend/ui"
import { sendReceiveTracking } from "@nfid/integration"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { useAllToken } from "frontend/features/fungible-token/use-all-token"
import { TransferModalCoordinator } from "frontend/features/transfer-modal/coordinator"
import { getWalletDelegationAdapter } from "frontend/integration/adapters/delegations"
import { ProfileContext } from "frontend/provider"
import { Container } from "frontend/ui/atoms/container"
import { Loader } from "frontend/ui/atoms/loader"
import ProfileHeader from "frontend/ui/organisms/profile-header"
import ProfileSidebar from "frontend/ui/organisms/profile-sidebar"

import ProfileContainer from "../profile-container/Container"

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
  withTabs?: boolean
  withPortfolio?: boolean
}

const tabs = [
  {
    name: "Tokens",
    title: <>Tokens</>,
    path: `/wallet/${ProfileConstants.tokens}`,
  },
  {
    name: "NFTs",
    title: <>NFTs</>,
    path: `/wallet/${ProfileConstants.nfts}`,
  },
  {
    name: "Activity",
    title: <>Activity</>,
    path: `/wallet/${ProfileConstants.activity}`,
  },
]

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
  withTabs,
  withPortfolio,
}) => {
  const handleNavigateBack = useCallback(() => {
    window.history.back()
  }, [])

  const location = useLocation()
  const navigate = useNavigate()

  const activeTab = useMemo(() => {
    return tabs.find((tab) => tab.path === location.pathname) ?? { name: "" }
  }, [location.pathname])

  const globalServices = useContext(ProfileContext)
  const { token, isLoading: isTokenLoading } = useAllToken()

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
    send({ type: "CHANGE_DIRECTION", data: "send" })
    send("SHOW")
  }

  const onReceiveClick = () => {
    sendReceiveTracking.openModal()
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: "receive" })
    send("SHOW")
  }

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
          "!block",
          containerClassName,
        )}
      >
        <div className={clsx("hidden mt-5 -ml-3 md:block relative")}>
          <ProfileSidebar id="desktop" />
        </div>
        <section className={clsx("relative", className)}>
          {pageTitle && (
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
          )}
          {withPortfolio && (
            <ProfileInfo
              value={tokensUsdValue}
              isLoading={isTokenLoading && isIdentityLoading && isValidating}
              onSendClick={onSendClick}
              onReceiveClick={onReceiveClick}
              address={identity?.getPrincipal().toString() ?? ""}
            />
          )}
          {withTabs && (
            <TabsSwitcher
              className="my-[30px]"
              tabs={tabs}
              activeTab={activeTab?.name}
              setActiveTab={(tabName) => {
                const tab = tabs.find((t) => t.name === tabName)
                if (tab) navigate(tab.path)
              }}
            />
          )}
          <ProfileContainer>
            <Outlet />
          </ProfileContainer>
          {children}
        </section>
      </div>
      <Loader isLoading={isLoading} />
    </div>
  )
}

export default ProfileTemplate
