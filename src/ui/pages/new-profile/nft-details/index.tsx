import clsx from "clsx"
import React from "react"
import { To } from "react-router-dom"
import { toast } from "react-toastify"

import { ITransaction } from "frontend/apps/identity-manager/profile/nft-details/utils"
import { link } from "frontend/integration/entrepot"
import { NFTDetails, UserNFTDetails } from "frontend/integration/entrepot/types"
import { Application } from "frontend/integration/identity-manager"
import { Loader } from "frontend/ui/atoms/loader"
import Table from "frontend/ui/atoms/table"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import CopyIcon from "./assets/copy.svg"
import WalletIcon from "./assets/wallet.svg"

import { NFTAsset } from "./nft-asset"

interface IProfileNFTDetails {
  nft: UserNFTDetails | NFTDetails
  isTransactionsFetching?: boolean
  transactions: ITransaction[]
  applications: Application[]
}

export const ProfileNFTDetailsPage = ({
  nft,
  isTransactionsFetching = false,
  transactions,
  applications,
}: IProfileNFTDetails) => {
  const copyToClipboard = React.useCallback(() => {
    toast.info("NFT URL copied to clipboard", { toastId: "NFTCopied" })
    navigator.clipboard.writeText(link(nft.collection.id, nft.index))
  }, [nft.collection.id, nft.index])

  return (
    <ProfileTemplate
      // I have not found any other ways to avoid as To. This is exactly what navigate expect
      onBack={-1 as To}
      icon={CopyIcon}
      onIconClick={copyToClipboard}
      className="w-full min-w-fit z-[1]"
      containerClassName="overflow-x-auto px-0"
    >
      <div
        className={clsx(
          "grid gap-[30px] max-w-[100vw]",
          "grid-cols-1 sm:grid-cols-[auto,1fr]",
        )}
      >
        <div className="relative overflow-hidden bg-gray-50 rounded-xl h-[342px] aspect-square">
          <div
            style={{
              backgroundImage: `url(${nft.assetPreview})`,
            }}
            className={clsx(
              "bg-cover bg-center bg-no-repeat blur-md brightness-150",
              "h-full absolute z-10 w-full opacity-70",
              nft.assetFullsize.format === "video" && "hidden",
            )}
          />
          <NFTAsset
            url={nft.assetFullsize.url}
            format={nft.assetFullsize.format}
          />
        </div>
        <div>
          <p className="font-bold text-blue-600">{nft.collection.name}</p>
          <p className="text-[28px] mt-2.5">{nft.name}</p>
          {"account" in nft ? (
            <div className="flex items-center mt-4 space-x-2">
              <img src={WalletIcon} alt="wallet" />
              <p className="text-sm font-semibold text-gray-400">
                {
                  applications.find((x) => x.domain === nft.account.domain)
                    ?.name
                }{" "}
                account {Number(nft.account.accountId) + 1}
              </p>
            </div>
          ) : null}
          <ProfileContainer title="Details" className="mt-6">
            <div className="mt-5 space-y-4 text-sm">
              <div
                className={clsx("flex items-center justify-between flex-wrap")}
              >
                <p className="mb-1 text-gray-400">Standard</p>
                <p className={clsx("w-full sm:w-[80%]")}>
                  {nft.collection.standard === "legacy"
                    ? "Legacy EXT"
                    : nft.collection.standard}
                </p>
              </div>
              <div
                className={clsx("flex items-center justify-between flex-wrap")}
              >
                <p className="mb-1 text-gray-400">NFT ID</p>
                <p className="w-full sm:w-[80%]">{nft.tokenId}</p>
              </div>
              <div
                className={clsx("flex items-center justify-between flex-wrap")}
              >
                <p className="mb-1 text-gray-400">Collection ID</p>
                <p className="w-full sm:w-[80%]">{nft.canisterId}</p>
              </div>
            </div>
          </ProfileContainer>
        </div>
      </div>
      <div className={clsx("mt-[30px] max-w-[100vw]")}>
        <ProfileContainer title="About">
          <p className="text-sm">{nft.collection.description}</p>
        </ProfileContainer>
      </div>
      <div
        className={clsx(
          "block border border-gray-200 rounded-xl",
          "my-[30px]",
          !transactions.length && !isTransactionsFetching && "hidden",
        )}
      >
        <div
          className={clsx(
            "ml-5 sm:ml-[30px]",
            "mt-4 sm:mt-[26px]",
            "mb-3 text-xl",
          )}
        >
          Activity
        </div>
        <Table
          headings={["Event type", "Date and time", "From", "To", "Price"]}
          rows={transactions.map((transaction) => ({
            key: `${transaction.from}${transaction.to}${transaction.datetime}`,
            val: Object.values(transaction).map((value, i) => (
              <span
                className={clsx(
                  "text-sm",
                  i === 0 && "capitalize",
                  (i === 1 || i === 4) && "whitespace-nowrap",
                  (i === 2 || i === 3) && "w-[286px] break-words inline-block",
                )}
              >
                {value}
              </span>
            )),
          }))}
        />
        <div className="flex justify-center w-full h-16 py-2">
          <Loader fullscreen={false} isLoading={isTransactionsFetching} />
        </div>
      </div>
    </ProfileTemplate>
  )
}
