import { useActor } from "@xstate/react"
import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
import { Balance } from "packages/ui/src/organisms/profile-info/balance"
import { Tokens } from "packages/ui/src/organisms/tokens"
import { ScanTokens } from "packages/ui/src/organisms/tokens/components/scan-tokens"
import { useContext, useEffect, useMemo, useState } from "react"
import { userPrefService } from "src/integration/user-preferences/user-pref-service"
import useSWR from "swr"

import { Skeleton } from "@nfid-frontend/ui"
import { storageWithTtl } from "@nfid/client-db"
import { authState } from "@nfid/integration"
import {
  BTC_NATIVE_ID,
  CKBTC_CANISTER_ID,
} from "@nfid/integration/token/constants"
import { State } from "@nfid/integration/token/icrc1/enum/enums"
import { Icrc1Pair } from "@nfid/integration/token/icrc1/icrc1-pair/impl/Icrc1-pair"
import { icrc1OracleCacheName } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"
import { useSWRWithTimestamp } from "@nfid/swr"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { useBtcAddress } from "frontend/hooks"
import { FT } from "frontend/integration/ft/ft"
import { ftService } from "frontend/integration/ft/ft-service"
import { ProfileContext } from "frontend/provider"

import { ModalType } from "../transfer-modal/types"
import { fetchTokens, initTokens } from "./utils"

const TokensPage = () => {
  const [hideZeroBalance, setHideZeroBalance] = useState(false)
  const userRootPrincipalId = authState.getUserIdData().userId
  const globalServices = useContext(ProfileContext)
  const [, send] = useActor(globalServices.transferService)
  const [initedTokens, setInitedTokens] = useState<Array<FT> | undefined>()
  const { isBtcAddressLoading } = useBtcAddress()

  const onSendClick = (selectedToken: string) => {
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.SEND })
    send({ type: "ASSIGN_SELECTED_FT", data: selectedToken })
    send("SHOW")
  }

  const onSwapClick = (selectedToken: string) => {
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
    send({ type: "ASSIGN_SELECTED_FT", data: CKBTC_CANISTER_ID })
    send("SHOW")
  }

  const onStakeClick = (selectedToken: string) => {
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.STAKE })
    send({ type: "ASSIGN_SELECTED_FT", data: selectedToken })
    send("SHOW")
  }

  const { data: tokens = undefined, mutate: refetchTokens } =
    useSWRWithTimestamp("tokens", fetchTokens, {
      revalidateOnFocus: false,
      revalidateOnMount: false,
    })

  const activeTokens = useMemo(() => {
    return tokens?.filter((token) => token.getTokenState() === State.Active)
  }, [tokens])

  const tokensOwnedQuantity = useMemo(() => {
    return initedTokens?.filter(
      (token) =>
        token.getTokenBalance() !== undefined &&
        token.getTokenBalance()! > BigInt(0),
    ).length
  }, [initedTokens])

  const tokensWithoutPrice = useMemo(() => {
    return initedTokens?.filter((token) => token.getUSDBalance() === undefined)
      .length
  }, [initedTokens])

  const btc = useMemo(
    () => activeTokens?.find((t) => t.getTokenAddress() === BTC_NATIVE_ID),
    [activeTokens],
  )

  const {
    data: tokensUsdBalance,
    isLoading: tokensUsdBalanceLoading,
    mutate: refetchFtUsdBalance,
  } = useSWR(
    btc?.isInited() &&
      btc.getTokenBalance() !== undefined &&
      initedTokens &&
      initedTokens.length > 0
      ? "ftUsdValue"
      : null,
    async () => ftService.getFTUSDBalance(initedTokens!),
    { revalidateOnFocus: false },
  )

  useEffect(() => {
    refetchFtUsdBalance()
  }, [initedTokens, refetchFtUsdBalance])

  useEffect(() => {
    if (activeTokens) {
      initTokens(activeTokens, isBtcAddressLoading).then(setInitedTokens)
    }
  }, [activeTokens, isBtcAddressLoading])

  useEffect(() => {
    userPrefService.getUserPreferences().then((userPref) => {
      setHideZeroBalance(userPref.isHideZeroBalance())
    })
  }, [])

  const onZeroBalanceToggle = () => {
    userPrefService.getUserPreferences().then((userPref) => {
      userPref.setHideZeroBalance(!hideZeroBalance)
      setHideZeroBalance(!hideZeroBalance)
    })
  }

  const onSubmitIcrc1Pair = async (ledgerID: string, indexID: string) => {
    let icrc1Pair = new Icrc1Pair(
      ledgerID,
      indexID !== "" ? indexID : undefined,
    )
    await icrc1Pair.storeSelf()
    await storageWithTtl.remove(icrc1OracleCacheName)
    refetchTokens()
  }

  const onFetch = async (ledgerID: string, indexID: string) => {
    let icrc1Pair = new Icrc1Pair(ledgerID, indexID)

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
              tokensWithoutPrice === undefined ||
              isBtcAddressLoading ||
              (!btc?.isInited() && btc?.getTokenBalance() === undefined)
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
        <div className="flex items-center flex-1 md:justify-end">
          <ScanTokens triggerClassName="w-full sm:w-fit dark:text-white" />
        </div>
      </div>
      <ProfileContainer>
        <Tokens
          tokensIniting={!initedTokens}
          activeTokens={activeTokens || []}
          allTokens={tokens || []}
          isTokensLoading={!activeTokens}
          onSubmitIcrc1Pair={onSubmitIcrc1Pair}
          onFetch={onFetch}
          profileConstants={ProfileConstants}
          onSendClick={onSendClick}
          onSwapClick={onSwapClick}
          onConvertToBtc={onConvertToBtc}
          onConvertToCkBtc={onConvertToCkBtc}
          onStakeClick={onStakeClick}
          hideZeroBalance={hideZeroBalance}
          onZeroBalanceToggle={onZeroBalanceToggle}
          isBtcAddressLoading={isBtcAddressLoading}
        />
      </ProfileContainer>
    </>
  )
}

export default TokensPage
