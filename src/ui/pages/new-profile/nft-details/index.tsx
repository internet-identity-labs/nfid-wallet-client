import clsx from "clsx"
import React from "react"
import { toast } from "react-toastify"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { link } from "frontend/integration/entrepot"
import { UserNFTDetails } from "frontend/integration/entrepot/types"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import CopyIcon from "./assets/copy.svg"
import WalletIcon from "./assets/wallet.svg"

import { NFTAsset } from "./nft-asset"

interface IProfileNFTDetails {
  nft: UserNFTDetails
}
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
    >
      <div
        className={clsx(
          "grid gap-[30px]",
          "grid-cols-1 sm:grid-cols-[40%,1fr]",
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
      <ProfileContainer title="About" className="mt-[30px]">
        <p className="text-sm">{nft.collection.description}</p>
      </ProfileContainer>
      {/* <div className="border border-[#E5E7EB] rounded-xl p-[30px] mt-[30px]">
        <div className="flex items-center mb-[30px]">
          <p className="text-xl leading-6">Properties</p>
          <p className="w-5 h-5 flex items-center justify-center text-white rounded bg-black-base ml-[14px]">
            {propertiesList.length}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-[10px]">
          {propertiesList.map((prop) => {
            return (
              <PropertiItems
                valueOfRarity={prop.valueOfRarity}
                features={prop.features}
                valueFeatures={prop.valueFeatures}
              />
            )
          })}
        </div>
      </div> */}
    </ProfileTemplate>
  )
}
