import {
  useMemo,
  useCallback,
  FC,
  useEffect,
  useReducer,
  useState,
  memo,
} from "react"
import { ProfileTemplate } from "@nfid-frontend/ui"
import { NFIDTheme } from "frontend/App"
import { Permissions } from "packages/ui/src/organisms/permissions"
import { ftService, PAGE_SIZE } from "frontend/integration/ft/ft-service"
import { Principal } from "@icp-sdk/core/principal"
import { useSWR, useSWRWithTimestamp } from "@nfid/swr"
import { authState } from "@nfid/integration"
import { fetchTokens } from "../fungible-token/utils"
import { useTokensInit } from "packages/ui/src/organisms/send-receive/hooks/token-init"
import { TRIM_ZEROS } from "@nfid/integration/token/constants"
import {
  permissionsReducer,
  permissionsInitialState,
  NftApproval,
} from "./utils"
import { useIdentity } from "frontend/hooks/identity"
import { Button } from "@nfid-frontend/ui"
import toaster from "packages/ui/src/atoms/toast"
import { ModalComponent } from "@nfid-frontend/ui"
import { Spinner } from "packages/ui/src/atoms/spinner"
import { FormProvider, useForm } from "react-hook-form"
import { FormValues } from "../transfer-modal/types"
import { icrc7Source } from "frontend/integration/nft/sources/icrc7-source"
import { marketplaceService } from "@nfid/integration/marketplace"
import { MarketPlace } from "frontend/integration/nft/enum/enums"

type PermissionsPageProps = {
  walletTheme: NFIDTheme
  setWalletTheme: (theme: NFIDTheme) => void
}

const PermissionsPage: FC<PermissionsPageProps> = memo(
  ({ walletTheme, setWalletTheme }) => {
    const [state, dispatch] = useReducer(
      permissionsReducer,
      permissionsInitialState,
    )
    const { identity, isLoading: identityLoading } = useIdentity()
    const publicKey = authState.getUserIdData().publicKey
    const [isLoadingRevoke, setIsLoadingRevoke] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const { data: tokens } = useSWRWithTimestamp("tokens", fetchTokens, {
      revalidateOnFocus: false,
      revalidateOnMount: false,
    })
    const { initedTokens } = useTokensInit(tokens)

    const formMethods = useForm<FormValues>({
      mode: "all",
      defaultValues: {
        amount: "",
      },
    })

    const revokeAll = async () => {
      try {
        if (!identity) return
        setIsLoadingRevoke(true)

        await ftService.revokeAllAllowances(identity, state.allowancesList)
        dispatch({ type: "RESET", payload: { list: [] } })

        if (state.nftApprovalsList.length > 0) {
          const seller = Principal.from(publicKey)
          const listings = await marketplaceService.getListingsBySeller(seller)
          await Promise.all(
            state.nftApprovalsList.map(async (nft) => {
              const matching = listings.find(
                (l) =>
                  l.collectionId === nft.collectionId &&
                  l.tokenId === nft.tokenId,
              )
              if (matching) {
                await marketplaceService.cancelListing(identity, matching.id)
              } else {
                await marketplaceService.revokeNftApproval(
                  identity,
                  nft.collectionId,
                  nft.tokenId,
                )
              }
            }),
          )
          dispatch({ type: "RESET_NFT_APPROVALS", payload: { list: [] } })
        }

        toaster.success("All token approvals have been successfully revoked")
      } catch (e) {
        toaster.error(`Revoke error. ${(e as Error).message}`)
      } finally {
        setIsLoadingRevoke(false)
        setIsModalOpen(false)
      }
    }

    const { data: initialPage, isLoading } = useSWR(
      initedTokens ? ["allowances", 0] : null,
      () =>
        ftService.getIcrc2Allowances(
          initedTokens!,
          Principal.from(publicKey),
          0,
          PAGE_SIZE,
        ),
      { revalidateOnFocus: false },
    )

    useEffect(() => {
      if (initialPage) {
        dispatch({ type: "RESET", payload: { list: initialPage } })
      }
    }, [initialPage])

    const { data: nftApprovals, isLoading: isNftApprovalsLoading } = useSWR(
      publicKey ? "nft-approvals" : null,
      async () => {
        const principal = Principal.from(publicKey)
        const ownedTokens = await icrc7Source.getUserTokens(principal, false)
        const icrc7Tokens = ownedTokens.filter(
          (t) => t.marketPlace === MarketPlace.ICRC7,
        )
        const results = await Promise.all(
          icrc7Tokens.map(async (token) => {
            try {
              const tokenId = BigInt(token.tokenNumber)
              const approved = await marketplaceService.isApproved(
                token.collectionId,
                tokenId,
              )
              if (!approved) return null
              const approval: NftApproval = {
                collectionId: token.collectionId,
                collectionName: token.collectionName,
                tokenId,
                tokenName: token.name ?? `#${token.tokenNumber}`,
                spender: ICRC1_ORACLE_CANISTER_ID,
              }
              if (token.collectionLogo)
                approval.collectionLogo = token.collectionLogo
              if (token.image) approval.tokenImage = token.image
              return approval
            } catch {
              return null
            }
          }),
        )
        return results.filter((r): r is NftApproval => r !== null)
      },
      { revalidateOnFocus: false },
    )

    useEffect(() => {
      if (nftApprovals !== undefined) {
        dispatch({
          type: "RESET_NFT_APPROVALS",
          payload: { list: nftApprovals },
        })
      }
    }, [nftApprovals])

    const handleNftRevoke = useCallback(
      async (nft: NftApproval) => {
        if (!identity) return
        const seller = Principal.from(publicKey)
        const listings = await marketplaceService.getListingsBySeller(seller)
        const matching = listings.find(
          (l) =>
            l.collectionId === nft.collectionId && l.tokenId === nft.tokenId,
        )
        if (matching) {
          await marketplaceService.cancelListing(identity, matching.id)
        } else {
          await marketplaceService.revokeNftApproval(
            identity,
            nft.collectionId,
            nft.tokenId,
          )
        }
        dispatch({
          type: "REMOVE_NFT_APPROVAL",
          payload: { collectionId: nft.collectionId, tokenId: nft.tokenId },
        })
      },
      [identity, publicKey],
    )

    const loadMore = useCallback(async () => {
      if (!state.hasMore || !initedTokens) return

      dispatch({ type: "LOAD_MORE_START" })
      try {
        const nextBatch = await ftService.getIcrc2Allowances(
          initedTokens,
          Principal.from(publicKey),
          state.page * PAGE_SIZE,
          PAGE_SIZE,
        )

        dispatch({ type: "LOAD_MORE_SUCCESS", payload: { list: nextBatch } })
      } catch (_e) {
        dispatch({ type: "LOAD_MORE_SUCCESS", payload: { list: [] } })
      }
    }, [state.page, state.hasMore, publicKey, initedTokens])

    const flattenedAllowances = useMemo(() => {
      return state.allowancesList.map(({ token, allowance: a }) => {
        const amountNum = Number(a.allowance) / 10 ** token.getTokenDecimals()
        const amountStr = amountNum
          .toFixed(token.getTokenDecimals())
          .replace(TRIM_ZEROS, "")

        const usdAmount = (() => {
          if (!token) return null

          try {
            const rate = token.getTokenRate(amountStr)
            return rate
              ? rate.toFixed(token.getTokenDecimals()).replace(TRIM_ZEROS, "")
              : null
          } catch {
            return null
          }
        })()

        return {
          token,
          address: a.to_spender,
          amount: amountStr,
          amountFormatted: `${amountStr} ${token.getTokenSymbol()}`,
          usdAmount,
        }
      })
    }, [state.allowancesList])

    return (
      <ProfileTemplate
        showBackButton
        pageTitle="Permissions"
        className="dark:text-white"
        walletTheme={walletTheme}
        setWalletTheme={setWalletTheme}
        headerMenu={
          flattenedAllowances.length === 0 &&
          state.nftApprovalsList.length === 0 ? null : (
            <Button
              disabled={state.isLoadingMore || isLoadingRevoke}
              className="ml-auto"
              onClick={() => setIsModalOpen(true)}
              type="stroke"
              isSmall
            >
              {isLoadingRevoke ? "Loading..." : "Revoke all"}
            </Button>
          )
        }
      >
        <FormProvider {...formMethods}>
          <Permissions
            allowances={flattenedAllowances}
            nftApprovals={state.nftApprovalsList}
            isNftApprovalsLoading={isNftApprovalsLoading}
            onRevokeNftApproval={handleNftRevoke}
            isLoading={
              isLoading || (!initialPage && state.allowancesList.length === 0)
            }
            loadMore={loadMore}
            isLoadingMore={state.isLoadingMore}
            hasMore={state.hasMore}
            identity={identity}
            identityLoading={identityLoading}
            dispatch={dispatch}
          />
        </FormProvider>
        <ModalComponent
          isVisible={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
          }}
          className="p-5 w-[95%] md:w-[540px] z-[100] !rounded-[24px]"
        >
          <p className="text-[20px] leading-[26px] font-bold dark:text-white mb-[18px]">
            Revoke all approvals
          </p>
          <p className="leading-[22px] dark:text-white">
            You are about to revoke all token approvals previously granted to
            other services.
          </p>
          <div className="mt-5 flex justify-end gap-2.5">
            <Button
              type="stroke"
              isSmall
              className="w-[115px]"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>

            <Button
              isSmall
              className="w-[115px]"
              onClick={revokeAll}
              disabled={identityLoading || !identity || isLoadingRevoke}
              icon={isLoadingRevoke ? <Spinner /> : null}
            >
              Revoke
            </Button>
          </div>
        </ModalComponent>
      </ProfileTemplate>
    )
  },
)

export default PermissionsPage
