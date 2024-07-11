import { AccountIdentifier } from "@dfinity/ledger-icp"
import { isPresentInStorage } from "packages/integration/src/lib/lambda/domain-key-repository"
import React, { useState } from "react"
import useSWR from "swr"

import { BlurredLoader, Button } from "@nfid-frontend/ui"
import {
  E8S,
  ICP_DECIMALS,
  WALLET_FEE_E8S,
} from "@nfid/integration/token/constants"

import { AuthAppMeta } from "frontend/features/authentication/ui/app-meta"
import { toUSD } from "frontend/features/fungable-token/accumulate-app-account-balances"
import { useICPExchangeRate } from "frontend/features/fungable-token/icp/hooks/use-icp-exchange-rate"
import { TransferSuccess } from "frontend/features/transfer-modal/components/success"
import { RequestStatus } from "frontend/features/types"
import { getWalletDelegationAdapter } from "frontend/integration/adapters/delegations"
import { getNFTByTokenId } from "frontend/integration/entrepot"
import { AuthorizingAppMeta } from "frontend/state/authorization"
import { icTransferConnector } from "frontend/ui/connnector/transfer-modal/ic/ic-transfer-connector"
import { TickerAmount } from "frontend/ui/molecules/ticker-amount"

import { SDKFooter } from "../ui/footer"
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

  const { data: identity } = useSWR("globalIdentity", () =>
    getWalletDelegationAdapter("nfid.one", "-1"),
  )

  const {
    data: balance,
    isLoading: isBalanceLoading,
    isValidating: isBalanceValidating,
  } = useSWR(identity ? ["userBalance", identity] : null, ([key, identity]) =>
    icTransferConnector.getBalance(
      AccountIdentifier.fromPrincipal({
        principal: identity.getPrincipal(),
      }).toHex(),
    ),
  )

  // useEffect(() => {
  //   //if (identity) {
  //   mutate(["userBalance", identity])
  //   //}
  // }, [identity?.getPrincipal()])

  console.log("wtfff", balance, identity?.getPrincipal())

  const isApproveButtonDisabled =
    balance === undefined || isBalanceLoading || isBalanceValidating
  console.debug("RequestTransfer", { isApproveButtonDisabled })

  const { data: nft } = useSWR(
    tokenId && identity ? ["nftDetails", tokenId, identity] : null,
    ([key, id, identity]) =>
      getNFTByTokenId(id, identity.getPrincipal().toString()),
  )

  const { data: fee } = useSWR("requestFee", () => icTransferConnector.getFee())
  const { exchangeRate: rate } = useICPExchangeRate()

  if (!fee || typeof rate === "undefined")
    return <BlurredLoader isLoading={true} />

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
        assetImg={
          nft?.assetPreview.url ??
          icTransferConnector.getTokenConfig()?.icon ??
          ""
        }
        isAssetPadding={!tokenId}
        withToasts={false}
      />
    )

  return (
    <>
      <AuthAppMeta
        applicationLogo={appMeta?.logo}
        applicationURL={appMeta?.url ?? appMeta.name}
        applicationName={appMeta?.name}
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
      <div className="flex flex-col my-5">
        <div className="flex items-center justify-between text-sm border-b border-gray-200 h-14">
          <p>Network fee</p>
          <div className="text-right">
            <p>
              {nft
                ? "$0.00"
                : Boolean(rate) && (
                    <TickerAmount
                      symbol="ICP"
                      value={Number(fee)}
                      decimals={ICP_DECIMALS}
                      usdRate={rate}
                    />
                  )}
            </p>
            <p className="text-xs text-gray-400">
              {nft ? (
                "0.00"
              ) : (
                <TickerAmount
                  symbol="ICP"
                  value={Number(fee)}
                  decimals={ICP_DECIMALS}
                />
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm h-14">
          <p className="font-bold">Total</p>
          <div className="text-right">
            <p className="font-bold">
              {amount
                ? toUSD(
                    (Number(amount) + Number(WALLET_FEE_E8S)) / E8S,
                    Number(rate),
                  )
                : "$0.00"}
            </p>
            <p className="text-xs text-gray-400">
              {amount
                ? (Number(amount) + Number(WALLET_FEE_E8S)) / E8S
                : "0.00"}{" "}
              ICP
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-2.5 flex flex-col mb-14 mt-6">
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
                  if (!isPresentInStorage(derivationOrigin || origin))
                    throw new Error(
                      "You can not request canister calls with anonymous delegation",
                    )
                  if (tokenId && !nft)
                    throw new Error("Couldn't find NFT. Please try again.")

                  let transferIdentity = tokenId
                    ? await getWalletDelegationAdapter("nfid.one", "-1", [
                        nft?.canisterId!,
                      ])
                    : identity ?? (await getWalletDelegationAdapter())

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

                  const res = await icTransferConnector.transfer(request)

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

        <SDKFooter
          identity={identity}
          balance={balance}
          isBalanceLoading={isBalanceLoading || isBalanceValidating}
        />
      </div>
    </>
  )
}
