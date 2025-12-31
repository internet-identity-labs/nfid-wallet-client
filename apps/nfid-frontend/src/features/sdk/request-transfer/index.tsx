import { AccountIdentifier } from "@dfinity/ledger-icp"
import { isPresentInStorage } from "packages/integration/src/lib/lambda/domain-key-repository"
import { TickerAmount } from "packages/ui/src/molecules/ticker-amount"
import { AuthAppMeta } from "packages/ui/src/organisms/authentication/app-meta"
import React, { useState } from "react"

import { Address, BlurredLoader, Button } from "@nfid-frontend/ui"
import { toUSD } from "@nfid-frontend/utils"
import { exchangeRateService } from "@nfid/integration"
import {
  E8S,
  ICP_DECIMALS,
  WALLET_FEE_E8S,
} from "@nfid/integration/token/constants"
import { useSWR } from "@nfid/swr"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import {
  getUserBalance,
  requestTransfer,
} from "frontend/features/transfer-modal/utils"
import { RequestStatus } from "frontend/features/types"
import { getWalletDelegationAdapter } from "frontend/integration/adapters/delegations"
import { getNFTByTokenId } from "frontend/integration/entrepot"
import { AuthorizingAppMeta } from "frontend/state/authorization"

import { SDKFooter } from "../ui/footer"
import { TransferSuccess } from "../ui/transfer-success.tsx"
import { RequestTransferFTDetails } from "./fungible-details"
import { RequestTransferNFTDetails } from "./non-fungible-details"
import { IRequestTransferResponse } from "./types"

export interface IRequestTransferProps {
  origin: string
  appMeta: AuthorizingAppMeta
  amount?: string
  memo?: bigint
  derivationOrigin?: string
  tokenId?: string
  destinationAddress: string
  onConfirmIC: (data: IRequestTransferResponse) => void
}
export const RequestTransfer: React.FC<IRequestTransferProps> = ({
  origin,
  appMeta,
  amount,
  memo,
  tokenId,
  destinationAddress,
  derivationOrigin,
  onConfirmIC,
}) => {
  const [transferPromise, setTransferPromise] = useState<any>(undefined)

  const { user } = useAuthentication()
  const {
    data: identity,
    isLoading: isIdentityLoading,
    isValidating: isIdentityValidating,
  } = useSWR([user?.principal, "globalIdentity"], () =>
    getWalletDelegationAdapter("nfid.one", "-1"),
  )

  const { data: rate } = useSWR("usdRate", () =>
    exchangeRateService.getICP2USD(),
  )

  const {
    data: balance,
    isLoading: isBalanceLoading,
    isValidating: isBalanceValidating,
  } = useSWR(identity ? ["userBalance", identity] : null, ([_key, identity]) =>
    getUserBalance(
      AccountIdentifier.fromPrincipal({
        principal: identity.getPrincipal(),
      }).toHex(),
    ),
  )

  const isApproveButtonDisabled =
    balance === undefined || isBalanceLoading || isBalanceValidating
  console.debug("RequestTransfer", { isApproveButtonDisabled })

  const { data: nft } = useSWR(
    tokenId && identity ? ["nftDetails", tokenId, identity] : null,
    ([_key, id, identity]) =>
      getNFTByTokenId(id, identity.getPrincipal().toString()),
  )

  if (typeof rate === "undefined") return <BlurredLoader isLoading={true} />

  if (transferPromise)
    return (
      <TransferSuccess
        initialPromise={transferPromise}
        callback={(res) =>
          onConfirmIC({ status: RequestStatus.SUCCESS, hash: res?.hash })
        }
        errorCallback={(res) =>
          onConfirmIC({
            status: RequestStatus.ERROR,
            errorMessage: res?.errorMessage?.message ?? "Request failed",
          })
        }
        title={
          nft?.name ?? `${(Number(amount) + Number(WALLET_FEE_E8S)) / E8S} ICP`
        }
        subTitle={
          nft?.collection.name ??
          toUSD((Number(amount) + Number(WALLET_FEE_E8S)) / E8S, Number(rate))
        }
        assetImg={nft?.assetPreview.url ?? ""}
        isAssetPadding={!tokenId}
        withToasts={false}
      />
    )

  return (
    <>
      <AuthAppMeta
        applicationURL={appMeta?.url ?? appMeta.name}
        title="Approve transfer"
        subTitle="Request from"
      />
      {tokenId ? (
        <RequestTransferNFTDetails nft={nft} />
      ) : (
        <RequestTransferFTDetails
          amount={`${Number(amount) / E8S} ICP`}
          amountUSD={toUSD(Number(amount) / E8S, Number(rate))}
        />
      )}
      <div className="flex flex-col my-5 text-sm">
        <div className="flex items-center justify-between h-[54px]">
          <div>To</div>
          <div>
            <Address address={destinationAddress} />
          </div>
        </div>
        <div className="flex items-center justify-between h-[54px]">
          <div>Network fee</div>
          <div className="text-right">
            <TickerAmount
              symbol={"ICP"}
              value={nft ? 0 : WALLET_FEE_E8S}
              decimals={ICP_DECIMALS}
            />
            <br />
            <span className="text-xs text-gray-400">
              <TickerAmount
                symbol={"ICP"}
                value={nft ? 0 : WALLET_FEE_E8S}
                decimals={ICP_DECIMALS}
                usdRate={rate?.toNumber()}
              />
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between h-[54px] font-bold border-t border-gray-200">
          <div>Total</div>
          <div className="text-right">
            <TickerAmount
              symbol={"ICP"}
              value={nft ? 0 : Number(amount) + WALLET_FEE_E8S}
              decimals={ICP_DECIMALS}
            />
            <br />
            <span className="text-xs font-normal text-gray-400">
              <TickerAmount
                symbol={"ICP"}
                value={nft ? 0 : Number(amount) + WALLET_FEE_E8S}
                decimals={ICP_DECIMALS}
                usdRate={rate?.toNumber()}
              />
            </span>
          </div>
        </div>
      </div>
      <div className="gap-2.5 grid grid-cols-2 mb-[60px]">
        <Button
          id="rejectButton"
          type="stroke"
          onClick={() =>
            onConfirmIC({
              status: RequestStatus.REJECTED,
              errorMessage: "Rejected by user",
            })
          }
        >
          Reject
        </Button>
        <Button
          id={
            isApproveButtonDisabled ? "approveButtonDisabled" : "approveButton"
          }
          type="primary"
          disabled={isApproveButtonDisabled}
          onClick={() =>
            setTransferPromise(
              new Promise(async (resolve) => {
                try {
                  console.debug("RequestTransfer", { derivationOrigin, origin })
                  if (!(await isPresentInStorage(derivationOrigin || origin)))
                    throw new Error(
                      "You can not request canister calls with anonymous delegation",
                    )
                  if (tokenId && !nft)
                    throw new Error("Couldn't find NFT. Please try again.")

                  let transferIdentity = tokenId
                    ? await getWalletDelegationAdapter("nfid.one", "-1", [
                        nft?.canisterId!,
                      ])
                    : (identity ?? (await getWalletDelegationAdapter()))

                  const request = {
                    tokenId: tokenId,
                    amount: Number(amount) / E8S,
                    ...(memo ? { memo } : {}),
                    identity: transferIdentity,
                    to: destinationAddress,
                    currency: "ICP",
                    contract: "",
                  }
                  if (!tokenId) delete request.tokenId

                  const res = await requestTransfer(request)

                  resolve(res)
                } catch (e: any) {
                  onConfirmIC({
                    status: RequestStatus.ERROR,
                    errorMessage: e?.message ?? "Request failed",
                  })
                }
              }),
            )
          }
        >
          {isApproveButtonDisabled ? "loading..." : "Approve"}
        </Button>
        <SDKFooter
          identity={identity}
          balance={balance}
          isBalanceLoading={
            isBalanceLoading ||
            isBalanceValidating ||
            isIdentityValidating ||
            isIdentityLoading
          }
        />
      </div>
    </>
  )
}
