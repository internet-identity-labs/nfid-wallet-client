import {
  Address,
  IconCmpArrow,
  IconNftPlaceholder,
  ImageWithFallback,
} from "@nfid-frontend/ui"

import BigNumber from "bignumber.js"
import { CanisterCallTitle } from "../../constants"
import { ICRC7TransferMetadata } from "../../service/canister-calls-helpers/interfaces"
import { RPCPromptTemplate } from "../templates/prompt-template"
import { CallCanisterDetails } from "./details"
import { CallCanisterNFTList } from "./nft-list"
import React from "react"
import { TickerAmount } from "packages/ui/src/molecules/ticker-amount"
import { ICP_DECIMALS, TRIM_ZEROS } from "@nfid/integration/token/constants"
import { ICP_FEE_E8S } from "packages/ui/src/organisms/send-receive"
import clsx from "clsx"

export interface CallCanisterICRC7TransferProps {
  origin: string
  canisterId: string
  args: string
  request: any
  metadata: ICRC7TransferMetadata
  onApprove: (data: any) => void
  onReject: () => void
}

const CallCanisterICRC7Transfer = ({
  origin,
  canisterId,
  args,
  request,
  metadata,
  onApprove,
  onReject,
}: CallCanisterICRC7TransferProps) => {
  const [showNFTList, setShowNFTList] = React.useState(false)
  const applicationName = new URL(origin).host
  const tokens = (
    metadata.tokens ?? [
      {
        tokenId: metadata.tokenId,
        tokenName: metadata.tokenName,
        tokenImage: metadata.tokenImage,
      },
    ]
  ).map((t) => ({ ...t, collectionName: metadata.collectionName }))
  const isSingle = tokens.length === 1

  return (
    <RPCPromptTemplate
      title={CanisterCallTitle.icrc7_transfer}
      subTitle={
        <div className="dark:text-white">
          Request from{" "}
          <a
            href={origin}
            target="_blank"
            className="no-underline text-primaryButtonColor dark:text-teal-500"
            rel="noreferrer"
          >
            {applicationName}
          </a>
        </div>
      }
      onPrimaryButtonClick={() => onApprove(request)}
      onSecondaryButtonClick={onReject}
    >
      <div className="flex flex-col flex-1">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3 pt-[3px] pb-[3px] pl-[3px] pr-[10px] border border-black dark:border-white rounded-[12px]">
            <div className="relative w-[92px] h-[92px]">
              {tokens.map((token, index) => (
                <ImageWithFallback
                  key={`${token.collectionName}_${token.tokenId}`}
                  alt={token.tokenName}
                  src={token.tokenImage ?? metadata.collectionLogo ?? "#"}
                  fallbackSrc={IconNftPlaceholder}
                  className={clsx(
                    "w-full h-full rounded-[10px] object-cover shrink-0 border border-[#FFFFFF80] absolute top-0",
                    `left-[${index * 6}px]`,
                  )}
                />
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate dark:text-white">
                {tokens.length === 1
                  ? tokens[0].tokenName
                  : `${tokens.length} NFTs`}
              </p>
              <p className="text-xs text-gray-400 truncate dark:text-zinc-500">
                {[...new Set(tokens.map((t) => t.collectionName))].join(", ")}
              </p>
            </div>
            {!isSingle && (
              <IconCmpArrow
                className="w-4 h-4 text-black rotate-180 cursor-pointer shrink-0 dark:text-white"
                onClick={() => setShowNFTList(true)}
              />
            )}
          </div>
        </div>
        <div className="flex items-center justify-between h-[54px] text-sm dark:text-white mt-1">
          <span>To</span>
          <Address address={metadata.toAddress} />
        </div>
        <div className="flex items-center justify-between h-[54px] text-sm dark:text-white mt-1">
          <span>Network fee</span>
          <TickerAmount
            symbol="ICP"
            value={BigNumber(ICP_FEE_E8S)
              .div(10 ** ICP_DECIMALS)
              .toFixed(ICP_DECIMALS)
              .replace(TRIM_ZEROS, "")}
            decimals={ICP_DECIMALS}
          />
        </div>
        <CallCanisterDetails
          canisterId={canisterId}
          sender={metadata.sender}
          args={args}
        />
        <CallCanisterNFTList
          nftList={tokens}
          showNFTList={showNFTList}
          setShowNFTList={setShowNFTList}
        />
      </div>
    </RPCPromptTemplate>
  )
}

export default CallCanisterICRC7Transfer
