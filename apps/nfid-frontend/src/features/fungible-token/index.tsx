import { useActor } from "@xstate/react"
import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
import { Balance } from "packages/ui/src/organisms/profile-info/balance"
import { Tokens } from "packages/ui/src/organisms/tokens"
import { ScanTokens } from "packages/ui/src/organisms/tokens/components/scan-tokens"
import { useContext, useEffect, useMemo } from "react"
import useSWR from "swr"

import { Skeleton } from "@nfid-frontend/ui"
import { storageWithTtl } from "@nfid/client-db"
import { authState } from "@nfid/integration"
import {
  CKBTC_CANISTER_ID,
  CKETH_LEDGER_CANISTER_ID,
  CKSEPOLIA_LEDGER_CANISTER_ID,
  ETH_NATIVE_ID,
  EVM_NATIVE,
} from "@nfid/integration/token/constants"
import { Icrc1Pair } from "@nfid/integration/token/icrc1/icrc1-pair/impl/Icrc1-pair"
import { ICRC1_ORACLE_CACHE_NAME } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"
import { useSWRWithTimestamp } from "@nfid/swr"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { ftService } from "frontend/integration/ft/ft-service"
import { ProfileContext } from "frontend/provider"

import { ModalType, SelectedToken } from "../transfer-modal/types"
import { fetchTokens } from "./utils"
import { useTokensInit } from "packages/ui/src/organisms/send-receive/hooks/token-init"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { useUserPrefs } from "frontend/hooks/user-prefs"

const TokensPage = () => {
  const {
    hideZeroBalance,
    testnetEnabled,
    arbitrumEnabled,
    baseEnabled,
    polygonEnabled,
    setHideZeroBalance,
    setTestnetEnabled,
    setArbitrumEnabled,
    setBaseEnabled,
    setPolygonEnabled,
  } = useUserPrefs()
  const {
    transferService,
    isViewOnlyMode,
    viewOnlyAddress,
    viewOnlyAddressType,
  } = useContext(ProfileContext)
  const userRootPrincipalId = isViewOnlyMode
    ? ""
    : authState.getUserIdData().userId
  const [, send] = useActor(transferService)

  const onSendClick = (selectedToken: SelectedToken) => {
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.SEND })
    send({ type: "ASSIGN_SELECTED_FT", data: selectedToken })
    send("SHOW")
  }

  const onSwapClick = (selectedToken: SelectedToken) => {
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.SWAP })
    send({ type: "ASSIGN_SELECTED_FT", data: selectedToken })
    send({ type: "ASSIGN_SELECTED_TARGET_FT", data: "" })
    send("SHOW")
  }

  const onConvertToCkBtc = () => {
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.CONVERT })
    send("SHOW")
  }

  const onConvertToBtc = () => {
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.CONVERT })
    send({
      type: "ASSIGN_SELECTED_FT",
      data: { address: CKBTC_CANISTER_ID, chainId: ChainId.ICP },
    })
    send("SHOW")
  }

  const onConvertToCkEth = () => {
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.CONVERT })
    send({
      type: "ASSIGN_SELECTED_FT",
      data: { address: ETH_NATIVE_ID, chainId: ChainId.ETH },
    })
    send("SHOW")
  }

  const onConvertToCkSepoliaEth = () => {
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.CONVERT })
    send({
      type: "ASSIGN_SELECTED_FT",
      data: { address: EVM_NATIVE, chainId: ChainId.ETH_SEPOLIA },
    })
    send("SHOW")
  }

  const onConvertToEth = () => {
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.CONVERT })
    send({
      type: "ASSIGN_SELECTED_FT",
      data: { address: CKETH_LEDGER_CANISTER_ID, chainId: ChainId.ICP },
    })
    send("SHOW")
  }

  const onConvertToSepoliaEth = () => {
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.CONVERT })
    send({
      type: "ASSIGN_SELECTED_FT",
      data: { address: CKSEPOLIA_LEDGER_CANISTER_ID, chainId: ChainId.ICP },
    })
    send("SHOW")
  }

  const onStakeClick = (selectedToken: SelectedToken) => {
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.STAKE })
    send({ type: "ASSIGN_SELECTED_FT", data: selectedToken })
    send("SHOW")
  }

  const { data: tokens = undefined, mutate: refetchTokens } =
    useSWRWithTimestamp(
      isViewOnlyMode ? ["tokens", viewOnlyAddress] : "tokens",
      () => {
        if (!isViewOnlyMode) return fetchTokens()

        if (viewOnlyAddressType === "icp")
          return ftService.getIcpViewOnlyTokens(viewOnlyAddress!)
        if (viewOnlyAddressType === "btc")
          return ftService.getBtcViewOnlyTokens()
        return ftService.getEvmViewOnlyTokens(viewOnlyAddress!)
      },
      {
        revalidateOnFocus: false,
        revalidateOnMount: isViewOnlyMode,
      },
    )

  const { initedTokens, isLoading: isTokensLoading } = useTokensInit(tokens)

  const tokensOwnedQuantity = useMemo(() => {
    return initedTokens?.filter(
      (token) =>
        token.getTokenBalance() !== undefined &&
        token.getTokenBalance()! > BigInt(0),
    ).length
  }, [initedTokens])

  const tokensWithoutPrice = useMemo(() => {
    return initedTokens?.filter(
      (token) =>
        token.getUSDBalance() === undefined &&
        token.getChainId() === ChainId.ICP,
    ).length
  }, [initedTokens])

  const {
    data: tokensUsdBalance,
    isLoading: tokensUsdBalanceLoading,
    mutate: refetchFtUsdBalance,
  } = useSWR(
    initedTokens && initedTokens.length > 0
      ? isViewOnlyMode
        ? ["ftUsdValue", viewOnlyAddress]
        : "ftUsdValue"
      : null,
    async () => ftService.getFTUSDBalance(initedTokens!),
    { revalidateOnFocus: false },
  )

  useEffect(() => {
    refetchFtUsdBalance()
  }, [initedTokens, refetchFtUsdBalance])

  const onZeroBalanceToggle = () => setHideZeroBalance(!hideZeroBalance)
  const onTestnetToggle = () => setTestnetEnabled(!testnetEnabled)
  const onArbitrumToggle = () => setArbitrumEnabled(!arbitrumEnabled)
  const onBaseToggle = () => setBaseEnabled(!baseEnabled)
  const onPolygonToggle = () => setPolygonEnabled(!polygonEnabled)

  const onSubmitIcrc1Pair = async (ledgerID: string, indexID: string) => {
    const icrc1Pair = new Icrc1Pair(
      ledgerID,
      indexID !== "" ? indexID : undefined,
    )
    await icrc1Pair.storeSelf()
    await storageWithTtl.remove(ICRC1_ORACLE_CACHE_NAME)
    refetchTokens()
  }

  const onFetch = async (ledgerID: string, indexID: string) => {
    const icrc1Pair = new Icrc1Pair(ledgerID, indexID)

    return await Promise.all([
      icrc1Pair.validateIfExists(userRootPrincipalId),
      icrc1Pair.validateStandard(),
      icrc1Pair.validateIndexCanister(),
    ])
      .then(() => icrc1Pair.getMetadata())
      .catch((e) => {
        throw e
      })
  }

  return (
    <>
      <div className="p-[20px] md:p-[30px] border-gray-200 dark:border-zinc-700 border rounded-[24px] mb-[20px] md:mb-[30px] flex flex-col md:flex-row">
        <div className="flex flex-col flex-1">
          <p className="mb-[16px] text-sm font-bold text-gray-400 dark:text-zinc-500">
            Token balance
          </p>
          <Balance
            id={"totalBalance"}
            className="text-[26px]"
            usdBalance={tokensUsdBalance}
            isLoading={
              tokensUsdBalanceLoading ||
              tokensOwnedQuantity === undefined ||
              tokensWithoutPrice === undefined
            }
          />
        </div>
        <div className="flex flex-1 my-[20px] md:my-[0]">
          <div className="flex flex-col mr-[30px]">
            <p className="mb-[10px] text-sm font-bold text-gray-400 dark:text-zinc-500">
              Token owned
            </p>
            <p className="mb-0 text-[26px] font-bold dark:text-white">
              {tokensOwnedQuantity === undefined ? (
                <Skeleton className="w-[80px] h-[20px] mt-[10px]" />
              ) : (
                tokensOwnedQuantity
              )}
            </p>
          </div>
          <div className="flex flex-col">
            <p className="mb-[10px] text-sm font-bold text-gray-400 dark:text-zinc-500">
              Tokens w/o price
            </p>
            <p className="mb-0 text-[26px] font-bold dark:text-white">
              {tokensWithoutPrice === undefined ? (
                <Skeleton className="w-[80px] h-[20px] mt-[10px]" />
              ) : (
                tokensWithoutPrice
              )}
            </p>
          </div>
        </div>
        {!isViewOnlyMode && (
          <div className="flex items-center flex-1 md:justify-end">
            <ScanTokens triggerClassName="w-full sm:w-fit dark:text-white" />
          </div>
        )}
      </div>
      <ProfileContainer>
        <Tokens
          initedTokens={initedTokens || []}
          allTokens={tokens || []}
          isTokensLoading={isTokensLoading}
          onSubmitIcrc1Pair={onSubmitIcrc1Pair}
          onFetch={onFetch}
          profileConstants={ProfileConstants}
          onSendClick={onSendClick}
          onSwapClick={onSwapClick}
          onConvertToBtc={onConvertToBtc}
          onConvertToCkBtc={onConvertToCkBtc}
          onConvertToEth={onConvertToEth}
          onConvertToCkEth={onConvertToCkEth}
          onConvertToSepoliaEth={onConvertToSepoliaEth}
          onConvertToCkSepoliaEth={onConvertToCkSepoliaEth}
          onStakeClick={onStakeClick}
          hideZeroBalance={hideZeroBalance}
          onZeroBalanceToggle={onZeroBalanceToggle}
          testnetEnabled={testnetEnabled}
          onTestnetToggle={onTestnetToggle}
          arbitrumEnabled={arbitrumEnabled}
          onArbitrumToggle={onArbitrumToggle}
          baseEnabled={baseEnabled}
          onBaseToggle={onBaseToggle}
          polygonEnabled={polygonEnabled}
          onPolygonToggle={onPolygonToggle}
        />
      </ProfileContainer>
    </>
  )
}

export default TokensPage
