import clsx from "clsx"
import React from "react"
import { toast } from "react-toastify"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { link } from "frontend/integration/entrepot"
import { UserNFTDetails } from "frontend/integration/entrepot/types"
import Table from "frontend/ui/atoms/table"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import CopyIcon from "./assets/copy.svg"
import WalletIcon from "./assets/wallet.svg"

import { NFTAsset } from "./nft-asset"

interface IProfileNFTDetails {
  nft: UserNFTDetails
}

const containerClassName = "max-w-[100vw] px-4 sm:px-[30px]"

export const ProfileNFTDetails = ({ nft }: IProfileNFTDetails) => {
  const copyToClipboard = React.useCallback(() => {
    toast.info("NFT URL copied to clipboard")
    navigator.clipboard.writeText(link(nft.collection.id, nft.index))
  }, [nft.collection.id, nft.index])

  return (
    <ProfileTemplate
      onBack={`${ProfileConstants.base}/${ProfileConstants.assets}`}
      icon={CopyIcon}
      onIconClick={copyToClipboard}
      className="w-full min-w-fit z-[1]"
      containerClassName="overflow-x-auto px-0"
    >
      <div
        className={clsx(
          "grid gap-[30px]",
          "grid-cols-1 sm:grid-cols-[40%,1fr]",
          containerClassName,
        )}
      >
        <div className="relative overflow-hidden bg-gray-50 rounded-xl aspect-square">
          <NFTAsset
            url={nft.assetFullsize.url}
            format={nft.assetFullsize.format}
          />
        </div>
        <div className="">
          <p className="font-bold text-blue-600">{nft.collection.name}</p>
          <p className="text-[28px] mt-2.5">{nft.name}</p>
          <div className="flex items-center mt-4 space-x-2">
            <img src={WalletIcon} alt="wallet" />
            <p className="text-sm font-semibold text-gray-400">
              {nft.account.label}
            </p>
          </div>
          <ProfileContainer title="Details" className="mt-6">
            <div className="mt-5 space-y-4 text-sm">
              <div
                className={clsx("flex items-center justify-between flex-wrap")}
              >
                <p className="mb-1 text-gray-400">Standard</p>
                <p className={clsx("w-full sm:w-[80%]")}>
                  {nft.collection.standard}
                </p>
              </div>
              <div
                className={clsx("flex items-center justify-between flex-wrap")}
              >
                <p className="mb-1 text-gray-400">ID</p>
                <p className="w-full sm:w-[80%]">{nft.index}</p>
              </div>
              <div
                className={clsx("flex items-center justify-between flex-wrap")}
              >
                <p className="mb-1 text-gray-400">Canister</p>
                <p className="w-full sm:w-[80%]">{nft.canisterId}</p>
              </div>
            </div>
          </ProfileContainer>
        </div>
      </div>
      <div className={clsx("mt-[30px]", containerClassName)}>
        <ProfileContainer title="About">
          <p className="text-sm">{nft.collection.description}</p>
        </ProfileContainer>
      </div>
      <div
        className={clsx(
          "block border border-gray-200 rounded-xl",
          "my-[30px] mx-4",
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
          rows={[
            [
              "Mint",
              "Jan 28, 2018 - 11:00:45 am",
              "662di02jqd0912edjc98h9281ejd09fj09j09ejc09jx019665",
              "552di02jqd0912edjc98h928155d09fj09j09ejc09jx019665",
              "15 ICP",
            ],
            [
              "Sale",
              "Jan 28, 2018 - 11:00:45 am",
              "662di02jqd0912edjc98h9281ejd09fj09j09ejc09jx019665",
              "552di02jqd0912edjc98h928155d09fj09j09ejc09jx019665",
              "25 ICP",
            ],
          ]}
        />
      </div>
    </ProfileTemplate>
  )
}
