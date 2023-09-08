import clsx from "clsx"
import React, { useState } from "react"
import useSWR from "swr"

import { BlurredLoader, Button, Skeleton } from "@nfid-frontend/ui"
import { truncateString } from "@nfid-frontend/utils"
import { E8S, WALLET_FEE, WALLET_FEE_E8S } from "@nfid/integration/token/icp"

import { getNFTByTokenId } from "frontend/integration/entrepot"
import { getExchangeRate } from "frontend/integration/rosetta/get-exchange-rate"
import { AuthorizingAppMeta } from "frontend/state/authorization"
import { icTransferConnector } from "frontend/ui/connnector/transfer-modal/ic/ic-transfer-connector"

import { AuthAppMeta } from "../authentication/ui/app-meta"
import { toUSD } from "../fungable-token/accumulate-app-account-balances"
import { TransferSuccess } from "../transfer-modal/components/success"
import { TransferStatus } from "../types"
import { RequestTransferFTDetails } from "./fungible-details"
import { RequestTransferNFTDetails } from "./non-fungible-details"
import { IRequestTransferResponse } from "./types"

export interface IRequestTransferProps {
  appMeta: AuthorizingAppMeta
  amount?: string
  tokenId?: string
  sourceAddress: string
  destinationAddress: string
  onConfirmIC: (data: IRequestTransferResponse) => void
}
export const RequestTransfer: React.FC<IRequestTransferProps> = ({
  appMeta,
  amount,
  tokenId,
  sourceAddress,
  destinationAddress,
  onConfirmIC,
}) => {
  const [transferPromise, setTransferPromise] = useState<any>(undefined)

  const { data: nft } = useSWR(
    tokenId ? ["nftDetails", tokenId, sourceAddress] : null,
    ([key, id, principal]) => getNFTByTokenId(id, principal),
  )

  const { data: identity } = useSWR(
    sourceAddress ? [sourceAddress, "userIdentity"] : null,
    ([address]) => icTransferConnector.getIdentity(address),
  )

  const { data: balance } = useSWR("userBalance", () =>
    icTransferConnector.getBalance(sourceAddress),
  )

  const { data: fee } = useSWR("requestFee", () => icTransferConnector.getFee())
  const { data: rate } = useSWR("icpRate", getExchangeRate)

  if (!fee || typeof rate === "undefined")
    return <BlurredLoader isLoading={true} />

  if (transferPromise)
    return (
      <TransferSuccess
        initialPromise={transferPromise}
        callback={(res) =>
          onConfirmIC({ status: TransferStatus.SUCCESS, hash: res?.hash })
        }
        errorCallback={(res) =>
          onConfirmIC({
            status: TransferStatus.ERROR,
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
        <RequestTransferNFTDetails
          tokenId={tokenId}
          principalId={sourceAddress}
        />
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
            <p>{toUSD(WALLET_FEE, Number(rate))}</p>
            <p className="text-xs text-gray-400">{fee.fee}</p>
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
                : toUSD(WALLET_FEE, Number(rate))}
            </p>
            <p className="text-xs text-gray-400">
              {amount
                ? (Number(amount) + Number(WALLET_FEE_E8S)) / E8S
                : WALLET_FEE}{" "}
              ICP
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-2.5 flex flex-col mb-14 mt-6">
        <Button
          type="primary"
          onClick={() =>
            setTransferPromise(
              new Promise(async (resolve) => {
                try {
                  let transferIdentity = tokenId
                    ? await icTransferConnector.getIdentity(
                        sourceAddress,
                        nft?.canisterId,
                      )
                    : identity ??
                      (await icTransferConnector.getIdentity(sourceAddress))
                  const request = {
                    tokenId: tokenId,
                    amount: Number(amount) / E8S,
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
                    status: TransferStatus.ERROR,
                    errorMessage: e?.message ?? "Request failed",
                  })
                }
              }),
            )
          }
        >
          Approve
        </Button>
        <Button
          type="stroke"
          onClick={() =>
            onConfirmIC({
              status: TransferStatus.REJECTED,
              errorMessage: "Rejected by user",
            })
          }
        >
          Reject
        </Button>
      </div>
      <div
        className={clsx(
          "bg-gray-50 flex flex-col text-sm text-gray-500",
          "text-xs absolute bottom-0 left-0 w-full px-5 py-3 round-b-xl",
        )}
      >
        <div className="flex items-center justify-between">
          <p>Internet Computer</p>
          <p>Balance</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            {identity?.getPrincipal().toString() ? (
              truncateString(identity?.getPrincipal().toString(), 6, 4)
            ) : (
              <Skeleton className="w-40 h-5 bg-gray-300" />
            )}
          </div>
          <div className="flex items-center space-x-0.5">
            <span id="balance">
              {balance ? (
                `${balance.balance} ICP`
              ) : (
                <Skeleton className="w-20 h-5 bg-gray-300" />
              )}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
