import clsx from "clsx"
import { FC, Fragment, useState } from "react"

import {
  IconNftPlaceholder,
  Table,
  ImageWithFallback,
  BlurredLoader,
} from "@nfid-frontend/ui"
import { trimConcat } from "@nfid-frontend/utils"

import {
  AssetPreview,
  NFTTransactions,
  TokenProperties,
} from "frontend/integration/nft/impl/nft-types"
import { NFT } from "frontend/integration/nft/nft"

import ProfileContainer from "../../atoms/profile-container/Container"
import { ModalComponent } from "../../molecules/modal/index-v0"

export interface NFTDetailsProps {
  nft: NFT
  about: string
  properties: TokenProperties
  transactions: NFTTransactions
  assetPreview: AssetPreview
  isAboutLoading: boolean
  isPreviewLoading: boolean
  isPropertiesLoading: boolean
  isTransactionsLoading: boolean
}

export const NFTDetails: FC<NFTDetailsProps> = ({
  isAboutLoading,
  isPreviewLoading,
  isPropertiesLoading,
  isTransactionsLoading,
  nft,
  about,
  properties,
  transactions,
  assetPreview,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <ModalComponent
        isVisible={isModalOpen}
        className="!bg-transparent"
        onClose={() => setIsModalOpen(false)}
      >
        <div
          className="w-[95vw] h-[95vh] flex justify-center items-center"
          onClick={(e) => {
            if ((e.target as HTMLElement).id === "full-image") return
            setIsModalOpen(false)
          }}
        >
          <img
            id="full-image"
            src={assetPreview.url}
            alt={nft.getTokenName()}
            className="rounded-[24px] max-h-full max-w-full"
          />
        </div>
      </ModalComponent>
      <div
        className={clsx(
          "grid gap-[30px] max-w-[100vw] mb-[20px] sm:mb-[30px]",
          "grid-cols-1 lg:grid-cols-[auto,1fr]",
        )}
      >
        <div
          onClick={() => setIsModalOpen(true)}
          className={clsx(
            "relative overflow-hidden bg-gray-50 rounded-[24px] aspect-square cursor-pointer",
            "lg:max-w-[445px] h-full lg:h-[445px] flex items-center justify-center",
          )}
        >
          {isPreviewLoading ? (
            <BlurredLoader
              className="bg-transparent"
              overlayClassnames="!rounded-[24px]"
              isLoading
            />
          ) : !assetPreview.url ? (
            <ImageWithFallback
              src={"no image"}
              fallbackSrc={IconNftPlaceholder}
              alt="NFT preview"
              className="w-full"
            />
          ) : assetPreview.format === "video" ? (
            <video
              muted
              autoPlay
              loop
              className="w-full"
              src={assetPreview.url}
            ></video>
          ) : (
            <ImageWithFallback
              src={assetPreview.url}
              fallbackSrc={IconNftPlaceholder}
              alt="NFT preview"
              className="max-w-full max-h-full"
            />
          )}
        </div>
        <div
          className="flex flex-col"
          id={
            trimConcat("nft_token_", nft.getTokenName()) +
            "_" +
            trimConcat("", nft.getCollectionId())
          }
        >
          <p
            className="text-[28px] leading-[40px] mb-[8px]"
            id={`nft_token_${nft.getTokenName()}_${nft.getCollectionId()}`}
          >
            {nft.getTokenName()}
          </p>
          <p
            className="font-bold text-primaryButtonColor leading-[24px] mb-[20px]"
            id={`nft_collection_${nft.getCollectionId()}`}
          >
            {nft.getCollectionName()}
          </p>
          <ProfileContainer
            title="Details"
            className="!p-[20px] sm:!p-[30px] !m-0 flex-[100%]"
            innerClassName="!p-0"
            titleClassName="!p-0 mb-[22px]"
          >
            <div
              className={clsx(
                "min-h-[64px] sm:min-h-[54px] sm:border-b border-gray-100",
                "block sm:flex items-center",
              )}
            >
              <p className="text-gray-400 flex-shrink-0 flex-grow-0 basis-[160px] mb-[5px]">
                Standard
              </p>
              <p id={"token-standard"}>EXT</p>
            </div>
            <div
              className={clsx(
                "min-h-[64px] sm:min-h-[54px] sm:border-b border-gray-100",
                "block sm:flex items-center",
              )}
            >
              <p className="text-gray-400 flex-shrink-0 flex-grow-0 basis-[160px]">
                ID
              </p>
              <p id={`nft_id_${nft.getTokenId().replace(/\s/g, "")}`}>
                {nft.getTokenId()}
              </p>
            </div>
            <div
              className={clsx(
                "min-h-[64px] sm:min-h-[54px] sm:border-b border-gray-100",
                "block sm:flex items-center",
              )}
            >
              <p className="text-gray-400 flex-shrink-0 flex-grow-0 basis-[160px]">
                Collection ID
              </p>
              <p id={"collection-id"}>{nft.getCollectionId()}</p>
            </div>

            <div
              className={clsx(
                "min-h-[64px] sm:min-h-[54px]",
                "block sm:flex items-center",
              )}
            >
              <p className="text-gray-400 flex-shrink-0 flex-grow-0 basis-[160px]">
                Floor price
              </p>
              <p>
                {!nft.getTokenFloorPriceIcpFormatted() ? (
                  <span>Unknown</span>
                ) : (
                  <>
                    <span className="block">
                      {nft.getTokenFloorPriceIcpFormatted()}
                    </span>
                    <span className="block text-xs text-gray-400">
                      {nft.getTokenFloorPriceUSDFormatted()}
                    </span>
                  </>
                )}
              </p>
            </div>
          </ProfileContainer>
        </div>
      </div>
      <ProfileContainer
        className={clsx(
          "!p-[20px] sm:!p-[30px] mb-[20px] sm:mb-[30px] relative",
          !about && "hidden",
        )}
        innerClassName="!p-0"
        titleClassName="!p-0 mb-[22px]"
        title="About"
      >
        {isAboutLoading ? (
          <BlurredLoader
            className="bg-transparent"
            overlayClassnames="!rounded-[24px]"
            isLoading
          />
        ) : (
          <p id={"token-about"}>{about}</p>
        )}
      </ProfileContainer>
      <ProfileContainer
        className={clsx(
          "!p-[20px] sm:!p-[30px] mb-[20px] sm:mb-[30px] min-h-[250px] relative",
          (!properties.mappedValues || !properties.mappedValues.length) &&
            !isPropertiesLoading &&
            "hidden",
        )}
        innerClassName="!p-0"
        titleClassName="!p-0 mb-[22px]"
        title="Properties"
      >
        <div
          className={clsx(
            "grid gap-[10px] max-w-[100vw]",
            "grid-cols-1 sm:grid-cols-3",
          )}
        >
          {isPropertiesLoading ? (
            <BlurredLoader
              className="bg-transparent"
              overlayClassnames="!rounded-[24px]"
              isLoading
            />
          ) : (
            properties.mappedValues &&
            properties.mappedValues.map((property) => {
              return (
                <div
                  key={`${property.category}_${property.option}`}
                  className="rounded-[12px] bg-gray-50 py-[9px] px-[20px] text-sm font-semibold"
                >
                  <p className="leading-[22px] text-xs text-gray-400">
                    <span>{property.category}</span>
                  </p>
                  <p className="leading-[22px]">
                    <span className="mt-[2px]">{property.option}</span>
                  </p>
                </div>
              )
            })
          )}
        </div>
      </ProfileContainer>
      <ProfileContainer
        className={clsx(
          "!p-[20px] sm:!p-[30px] mb-[20px] sm:mb-[30px] relative",
          (!transactions.activity || !transactions.activity.length) &&
            !isTransactionsLoading &&
            "hidden",
        )}
        innerClassName="!p-0"
        titleClassName="!p-0 mb-[22px]"
        title="Activity"
      >
        <div className="max-w-[100%] overflow-auto">
          {isTransactionsLoading ? (
            <BlurredLoader
              className="bg-transparent"
              overlayClassnames="!rounded-[24px]"
              isLoading
            />
          ) : (
            <Table
              className="!min-w-[1050px] min-h-[100px]"
              theadClassName="!h-0 sm:!h-[40px]"
              id="nft-table"
              tableHeader={
                <tr className="text-sm font-bold text-gray-400">
                  <th className="w-[120px]">Event type</th>
                  <th className="w-[220px]">Date and time</th>
                  <th>From</th>
                  <th>To</th>
                  <th className="w-[100px]">Price</th>
                </tr>
              }
            >
              {transactions.activity &&
                transactions.activity.map((activity, index) => {
                  return (
                    <Fragment
                      key={`${activity
                        .getTransactionView()
                        .getFrom()}_${activity
                        .getTransactionView()
                        .getFormattedDate()}`}
                    >
                      <tr className="text-sm h-[60px]">
                        <td className="pr-[20px]">
                          {activity.getTransactionView().getType()}
                        </td>
                        <td className="pr-[20px]">
                          {activity.getTransactionView().getFormattedDate()}
                        </td>
                        <td className="pr-[20px] break-all">
                          {activity.getTransactionView().getFrom()}
                        </td>
                        <td className="pr-[50px] break-all">
                          {activity.getTransactionView().getTo()}
                        </td>
                        <td>
                          {index === 0 &&
                            (!nft.getTokenFloorPriceIcpFormatted() ? (
                              <div className="absolute top-0 bottom-0 h-[60px] my-auto">
                                Unknown
                              </div>
                            ) : (
                              <div className="absolute top-0 bottom-0 h-[60px] my-auto">
                                <span className="block">
                                  {nft.getTokenFloorPriceIcpFormatted()}
                                </span>
                                <span className="block text-xs text-gray-400">
                                  {nft.getTokenFloorPriceUSDFormatted()}
                                </span>
                              </div>
                            ))}
                        </td>
                      </tr>
                    </Fragment>
                  )
                })}
            </Table>
          )}
        </div>
      </ProfileContainer>
    </>
  )
}
