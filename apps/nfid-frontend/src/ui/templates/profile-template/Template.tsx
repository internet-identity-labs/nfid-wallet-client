import { Principal } from "@dfinity/principal"
import { useActor } from "@xstate/react"
import clsx from "clsx"
import { BtcBanner } from "packages/ui/src/molecules/btc-banner"
import ProfileHeader from "packages/ui/src/organisms/header/profile-header"
import ProfileInfo from "packages/ui/src/organisms/profile-info"
import {
  HTMLAttributes,
  useCallback,
  useState,
  ReactNode,
  FC,
  useMemo,
  useContext,
  useEffect,
} from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { swapTransactionService } from "src/integration/swap/transaction/transaction-service"
import { SwapStage } from "src/integration/swap/types/enums"
import useSWRImmutable from "swr/immutable"

import { ArrowButton, Loader, TabsSwitcher, Tooltip } from "@nfid-frontend/ui"
import { authState } from "@nfid/integration"
import {
  BTC_NATIVE_ID,
  CKBTC_CANISTER_ID,
} from "@nfid/integration/token/constants"
import { State } from "@nfid/integration/token/icrc1/enum/enums"
import { useSWR, useSWRWithTimestamp } from "@nfid/swr"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import {
  ProfileConstants,
  navigationPopupLinks,
} from "frontend/apps/identity-manager/profile/routes"
import { fetchNFTs } from "frontend/features/collectibles/utils/util"
import {
  fetchTokens,
  getFullUsdValue,
  initTokens,
} from "frontend/features/fungible-token/utils"
import { syncDeviceIIService } from "frontend/features/security/sync-device-ii-service"
import { TransferModalCoordinator } from "frontend/features/transfer-modal/coordinator"
import { ModalType } from "frontend/features/transfer-modal/types"
import { getAllVaults } from "frontend/features/vaults/services"
import { useBtcAddress } from "frontend/hooks"
import { FT } from "frontend/integration/ft/ft"
import { useProfile } from "frontend/integration/identity-manager/queries"
import { ProfileContext } from "frontend/provider"

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
  isWallet?: boolean
  withPortfolio?: boolean
  titleClassNames?: string
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
  isWallet,
  titleClassNames,
}) => {
  const handleNavigateBack = useCallback(() => {
    window.history.back()
  }, [])
  const [hasUncompletedSwap, setHasUncompletedSwap] = useState(false)
  const [btc, setBtc] = useState<FT>()

  const tabs = useMemo(() => {
    return [
      {
        name: "Tokens",
        title: <>Tokens</>,
        path: `${ProfileConstants.base}/${ProfileConstants.tokens}`,
      },
      {
        name: "NFTs",
        title: <>NFTs</>,
        path: `${ProfileConstants.base}/${ProfileConstants.nfts}`,
      },
      {
        name: "Staking",
        title: <>Staking</>,
        path: `${ProfileConstants.base}/${ProfileConstants.staking}`,
      },
      {
        name: "Activity",
        title: <>Activity</>,
        path: `${ProfileConstants.base}/${ProfileConstants.activity}`,
        hasNotification: hasUncompletedSwap,
      },
    ]
  }, [hasUncompletedSwap])

  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const checkTransactions = async () => {
      const transactions = await swapTransactionService.getTransactions()

      setHasUncompletedSwap(
        transactions.some((tx) => tx.getStage() !== SwapStage.Completed),
      )
    }

    checkTransactions()
  }, [])

  const activeTab = useMemo(() => {
    return (
      tabs.find((tab) => location.pathname.startsWith(tab.path)) ?? { name: "" }
    )
  }, [location.pathname, tabs])
  const { data: vaults } = useSWR(["vaults"], getAllVaults)
  const [isSyncEmailLoading, setIsSyncEmailLoading] = useState(false)
  const { profile } = useProfile()
  const { logout } = useAuthentication()
  const { isBtcAddressLoading } = useBtcAddress()

  const hasVaults = useMemo(() => !!vaults?.length, [vaults])

  const { data: tokens = [] } = useSWRWithTimestamp("tokens", fetchTokens, {
    revalidateOnFocus: false,
  })

  const activeTokens = useMemo(() => {
    return tokens.filter((token) => token.getTokenState() === State.Active)
  }, [tokens])

  const { data: initedTokens = [], mutate: reinitTokens } = useSWR(
    activeTokens.length > 0 && isWallet ? "initedTokens" : null,
    () => initTokens(activeTokens, !!isBtcAddressLoading),
    { revalidateOnFocus: false },
  )

  const { data: nfts, mutate: reinitNfts } = useSWR(
    "nftList",
    () => fetchNFTs(),
    {
      revalidateOnFocus: false,
    },
  )

  const balance = btc?.getTokenBalance()
  const isBtcInited = btc?.isInited()

  useEffect(() => {
    const btcToken = tokens.find((t) => t.getTokenAddress() === BTC_NATIVE_ID)
    if (!btcToken) return

    if (!btcToken.isInited() && !isBtcAddressLoading) {
      btcToken
        .init(Principal.fromText(authState.getUserIdData().publicKey))
        .then(() => {
          setBtc(btcToken)
        })
    }
  }, [tokens, isBtcAddressLoading])

  const isReady = useMemo(() => {
    return (
      Array.isArray(nfts?.items) &&
      initedTokens.length > 0 &&
      !!isWallet &&
      btc &&
      isBtcInited &&
      balance !== undefined &&
      !isBtcAddressLoading
    )
  }, [
    nfts?.items,
    initedTokens.length,
    isWallet,
    btc,
    isBtcAddressLoading,
    balance,
    isBtcInited,
  ])

  const {
    data: tokensUsdBalance,
    isLoading: isUsdLoading,
    isValidating,
    mutate: refetchFullUsdBalance,
  } = useSWR(
    isReady ? "fullUsdValue" : null,
    async () => getFullUsdValue(nfts?.items, initedTokens),
    { revalidateOnFocus: false },
  )

  useEffect(() => {
    reinitTokens()
    reinitNfts()
  }, [activeTokens, isWallet, isBtcAddressLoading, reinitTokens, reinitNfts])

  useEffect(() => {
    refetchFullUsdBalance()
  }, [initedTokens, refetchFullUsdBalance, isBtcAddressLoading])

  const {
    data: isEmailDeviceOutOfSyncWithII,
    mutate: refreshIsEmailDeviceOutOfSyncWithII,
  } = useSWRImmutable(
    profile?.anchor
      ? [profile.anchor.toString(), "isEmailDeviceOutOfSyncWithII"]
      : null,
    syncDeviceIIService.isEmailDeviceOutOfSyncWithII,
  )

  const syncEmailDeviceWithII = async (): Promise<void> => {
    setIsSyncEmailLoading(true)
    await syncDeviceIIService.syncEmailDeviceWithII()
    await refreshIsEmailDeviceOutOfSyncWithII()
    setIsSyncEmailLoading(false)
  }

  const globalServices = useContext(ProfileContext)

  const [, send] = useActor(globalServices.transferService)

  const onSendClick = () => {
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.SEND })
    send("SHOW")
  }

  const onReceiveClick = () => {
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.RECEIVE })
    send("SHOW")
  }

  const onSwapClick = () => {
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.SWAP })
    send({ type: "ASSIGN_SELECTED_TARGET_FT", data: "" })
    send("SHOW")
  }

  const onBtcSwapClick = () => {
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.SWAP })
    send({ type: "ASSIGN_SELECTED_TARGET_FT", data: CKBTC_CANISTER_ID })
    send("SHOW")
  }

  const onConvertClick = () => {
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.CONVERT })
    send("SHOW")
  }

  const onStakeClick = () => {
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.STAKE })
    send("SHOW")
  }

  const isUsdBalanceLoading =
    isUsdLoading ||
    !initedTokens.length ||
    isValidating ||
    isBtcAddressLoading ||
    !btc?.isInited() ||
    btc.getTokenBalance() === undefined

  return (
    <div className={clsx("relative min-h-screen overflow-hidden", className)}>
      <ProfileHeader
        className={clsx("px-4 sm:px-[30px]", headerClassName)}
        isLoading={isSyncEmailLoading}
        isEmailOutOfSync={isEmailDeviceOutOfSyncWithII}
        syncEmail={syncEmailDeviceWithII}
        anchor={profile?.anchor}
        logout={logout}
        profileConstants={ProfileConstants}
        links={navigationPopupLinks}
        assetsLink={`${ProfileConstants.base}/${ProfileConstants.tokens}`}
        hasVaults={hasVaults}
      />
      <TransferModalCoordinator />
      <div
        className={clsx(
          "relative z-1 px-[16px]",
          "sm:px-[30px]",
          "!block",
          isWallet && "pb-[130px] sm:pb-[90px]",
          containerClassName,
        )}
      >
        <section className={clsx("relative", className)}>
          <div className="flex justify-between items-center leading-[40px] mb-[30px]">
            <div className="sticky left-0 flex items-center space-x-2">
              {showBackButton && (
                <ArrowButton
                  buttonClassName="py-[7px]"
                  onClick={handleNavigateBack}
                  iconClassName="text-black"
                />
              )}
              <p
                className={clsx("text-[28px] block", titleClassNames)}
                id={"page_title"}
              >
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
          {isWallet && (
            <>
              <ProfileInfo
                usdBalance={isUsdBalanceLoading ? undefined : tokensUsdBalance}
                isUsdLoading={isUsdBalanceLoading}
                onSendClick={onSendClick}
                onReceiveClick={onReceiveClick}
                onSwapClick={onSwapClick}
                onConvertClick={onConvertClick}
                onStakeClick={onStakeClick}
                address={authState.getUserIdData().publicKey}
              />
              <BtcBanner
                onBtcSwapClick={onBtcSwapClick}
                onConvertClick={onConvertClick}
              />
              <TabsSwitcher
                className="my-[30px]"
                tabs={tabs}
                activeTab={activeTab?.name}
                setActiveTab={(tabName) => {
                  const tab = tabs.find((t) => t.name === tabName)
                  if (tab) navigate(tab.path)
                }}
              />
            </>
          )}
          <Outlet />
          {children}
        </section>
      </div>
      <Loader isLoading={isLoading} />
    </div>
  )
}

export default ProfileTemplate
