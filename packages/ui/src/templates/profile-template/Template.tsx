import { useActor } from "@xstate/react"
import clsx from "clsx"
import { BtcBanner } from "packages/ui/src/molecules/btc-banner"
import ProfileHeader from "packages/ui/src/organisms/header/profile-header"
import ProfileInfo from "packages/ui/src/organisms/profile-info"
import {
  HTMLAttributes,
  useState,
  ReactNode,
  FC,
  useMemo,
  useContext,
  useEffect,
  useCallback,
} from "react"
import { Outlet, useLocation, useNavigate, useMatch } from "react-router-dom"
import { swapTransactionService } from "src/integration/swap/transaction/transaction-service"
import { SwapStage } from "src/integration/swap/types/enums"
import useSWRImmutable from "swr/immutable"
import { Principal } from "@dfinity/principal"

import { ArrowButton, Loader, TabsSwitcher, Tooltip } from "@nfid-frontend/ui"
import { authState } from "@nfid/integration"
import {
  BTC_NATIVE_ID,
  CKBTC_CANISTER_ID,
  ETH_NATIVE_ID,
} from "@nfid/integration/token/constants"
import { useSWR, useSWRWithTimestamp, mutate } from "@nfid/swr"

import { NFIDTheme } from "frontend/App"
import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import {
  ProfileConstants,
  navigationPopupLinks,
} from "frontend/apps/identity-manager/profile/routes"
import { fetchNFTs } from "frontend/features/collectibles/utils/util"
import { nftService } from "frontend/integration/nft/nft-service"
import {
  fetchTokens,
  getFullUsdValue,
} from "frontend/features/fungible-token/utils"
import { ftService } from "frontend/integration/ft/ft-service"
import { useTokensInit } from "packages/ui/src/organisms/send-receive/hooks/token-init"
import { syncDeviceIIService } from "frontend/features/security/sync-device-ii-service"
import { TransferModalCoordinator } from "frontend/features/transfer-modal/coordinator"
import { ModalType } from "frontend/features/transfer-modal/types"
import { getAllVaults } from "frontend/features/vaults/services"
import { useProfile } from "frontend/integration/identity-manager/queries"
import { ProfileContext } from "frontend/provider"
import { ttlCacheService } from "@nfid/client-db"
import { STAKED_TOKENS_CACHE_NAME } from "frontend/integration/staking/service/staking-service-impl"
import {
  EVM_ACTIVITIES_CACHE_NAME,
  EVM_ERC20_ACTIVITIES_CACHE_NAME,
} from "frontend/integration/ethereum/evm-transaction.service"
import { ACTIVITY_CACHE_NAME } from "@nfid/integration/token/icrc1"
import { ICP_NFT_GEEK_CACHE_NAME } from "frontend/integration/nft/geek/nft-geek-service"
import { getAllActivity } from "frontend/features/activity/utils/activity"
import { PAGINATION_ITEMS } from "frontend/features/activity/constants"
import {
  EVM_BALANCE_CACHE_NAME,
  EVM_NFTS_CACHE_NAME,
} from "frontend/integration/ethereum/evm.service"
import { INITED_TOKENS_CACHE_NAME } from "frontend/integration/ft/ft-service"
import { ICRC1_ORACLE_CACHE_NAME } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"
import { ICRC1_REGISTRY_CACHE_NAME } from "@nfid/integration/token/icrc1/service/icrc1-registry-service"
import {
  ERC20_BALANCES_CACHE_NAME,
  ERC20_TOKENS_CACHE_NAME,
  ERC20_TOKENS_LIST_CACHE_NAME,
} from "frontend/integration/ethereum/erc20-abstract.service"

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
  walletTheme?: NFIDTheme
  setWalletTheme?: (theme: NFIDTheme) => void
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
  walletTheme,
  setWalletTheme,
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isViewOnlyMode, viewOnlyAddress, viewOnlyAddressType } =
    useContext(ProfileContext)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const isNftDetails = Boolean(
    useMatch(
      `${ProfileConstants.base}/${ProfileConstants.nfts}/${ProfileConstants.nftDetails}`,
    ),
  )

  const handleNavigateBack = () => {
    const pathname = !isNftDetails
      ? `${ProfileConstants.base}/${ProfileConstants.tokens}`
      : `${ProfileConstants.base}/${ProfileConstants.nfts}`
    navigate({ pathname, search: location.search })
  }

  const [hasUncompletedSwap, setHasUncompletedSwap] = useState(false)

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
        hasNotification: hasUncompletedSwap && !isViewOnlyMode,
      },
    ]
  }, [hasUncompletedSwap, isViewOnlyMode])

  useEffect(() => {
    if (isViewOnlyMode) return
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

  const hasVaults = useMemo(() => !!vaults?.length, [vaults])

  const { data: tokens = [] } = useSWRWithTimestamp(
    isViewOnlyMode ? ["tokens", viewOnlyAddress] : "tokens",
    () => {
      if (!isViewOnlyMode) return fetchTokens()
      if (viewOnlyAddressType === "icp")
        return ftService.getIcpViewOnlyTokens(viewOnlyAddress!)
      if (viewOnlyAddressType === "btc") return ftService.getBtcViewOnlyTokens()
      return ftService.getEvmViewOnlyTokens(viewOnlyAddress!)
    },
    { revalidateOnFocus: false },
  )

  const { initedTokens } = useTokensInit(tokens)

  const btc = useMemo(() => {
    return initedTokens?.find(
      (token) => token.getTokenAddress() === BTC_NATIVE_ID,
    )
  }, [initedTokens])

  const eth = useMemo(() => {
    return initedTokens?.find(
      (token) => token.getTokenAddress() === ETH_NATIVE_ID,
    )
  }, [initedTokens])

  const { data: nfts } = useSWR("nftList", () => fetchNFTs(), {
    revalidateOnFocus: false,
  })

  const isReady = useMemo(() => {
    return (
      nfts &&
      Array.isArray(nfts?.items) &&
      initedTokens &&
      !!isWallet &&
      eth &&
      btc
    )
  }, [nfts, initedTokens, isWallet, btc, eth])

  const isViewOnly = isViewOnlyMode && viewOnlyAddress && viewOnlyAddressType

  const { data: fullUsdBalance, isLoading: isUsdLoading } = useSWR(
    isReady || (isViewOnly && initedTokens)
      ? isViewOnlyMode
        ? ["fullUsdValue", viewOnlyAddress]
        : "fullUsdValue"
      : null,
    async () => {
      if (isViewOnly) {
        const viewOnlyNfts = await nftService.getViewOnlyNFTs(
          viewOnlyAddress!,
          viewOnlyAddressType!,
        )
        const principal =
          viewOnlyAddressType === "icp"
            ? Principal.fromText(viewOnlyAddress!)
            : Principal.anonymous()
        return getFullUsdValue(viewOnlyNfts.items, initedTokens!, principal)
      }
      return getFullUsdValue(nfts?.items!, initedTokens!)
    },
    { revalidateOnFocus: false },
  )

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

  const refreshPortfolio = useCallback(async () => {
    if (isRefreshing) return
    setIsRefreshing(true)

    switch (activeTab.name) {
      case "Tokens":
        await ttlCacheService.invalidate([
          INITED_TOKENS_CACHE_NAME,
          ICRC1_ORACLE_CACHE_NAME,
          ICRC1_REGISTRY_CACHE_NAME,
          EVM_BALANCE_CACHE_NAME,
          ERC20_TOKENS_LIST_CACHE_NAME,
          ERC20_TOKENS_CACHE_NAME,
          ERC20_BALANCES_CACHE_NAME,
        ])
        await mutate("tokens")
        await mutate("initedTokens")
        await mutate("ftUsdValue")
        break
      case "NFTs":
        await ttlCacheService.invalidate([
          ICP_NFT_GEEK_CACHE_NAME,
          EVM_NFTS_CACHE_NAME,
        ])
        await Promise.all([
          mutate("nftList"),
          mutate(
            (key) => typeof key === "string" && key.startsWith('["nftList"'),
          ),
        ])
        await mutate("nftTotalPrice")
        break
      case "Staking":
        await ttlCacheService.invalidate([STAKED_TOKENS_CACHE_NAME])
        await mutate("stakedTokens")
        break
      case "Activity":
        await ttlCacheService.invalidate([
          EVM_ACTIVITIES_CACHE_NAME,
          EVM_ERC20_ACTIVITIES_CACHE_NAME,
          ACTIVITY_CACHE_NAME,
        ])
        await getAllActivity(PAGINATION_ITEMS, initedTokens ?? [])
        await mutate(
          (key) => typeof key === "string" && key.startsWith('["activity"'),
        )
        break
    }

    await mutate("fullUsdValue")

    setIsRefreshing(false)
  }, [activeTab.name, isRefreshing])

  const isUsdBalanceLoading = isUsdLoading || !fullUsdBalance

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
        walletTheme={walletTheme}
        setWalletTheme={setWalletTheme}
      />
      {!isViewOnlyMode && <TransferModalCoordinator />}
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
          <div
            className={clsx(
              "flex justify-between items-center leading-[40px]",
              showBackButton && "mb-[30px]",
            )}
          >
            <div className="sticky left-0 flex items-center space-x-2">
              {showBackButton && (
                <ArrowButton
                  buttonClassName="py-[7px] dark:hover:bg-zinc-700"
                  onClick={handleNavigateBack}
                  iconClassName="text-black dark:text-white"
                />
              )}
              <p
                className={clsx(
                  "text-[28px] leading-[32px] block",
                  titleClassNames,
                )}
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
                usdBalance={isUsdBalanceLoading ? undefined : fullUsdBalance}
                isUsdLoading={isUsdBalanceLoading}
                onSendClick={onSendClick}
                onReceiveClick={onReceiveClick}
                onSwapClick={onSwapClick}
                onConvertClick={onConvertClick}
                onStakeClick={onStakeClick}
                refreshPortfolio={refreshPortfolio}
                isRefreshing={isRefreshing}
                address={
                  isViewOnlyMode
                    ? (viewOnlyAddress ?? "")
                    : authState.getUserIdData().publicKey
                }
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
                  if (tab)
                    navigate({ pathname: tab.path, search: location.search })
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
