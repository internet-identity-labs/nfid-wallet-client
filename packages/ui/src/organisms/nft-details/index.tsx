import clsx from "clsx"
import ImageWithFallback from "packages/ui/src/atoms/image-with-fallback"
import { MouseEvent, FC, Fragment } from "react"
import { trimConcat } from "src/ui/atoms/util/util"

import {
  IconNftPlaceholder,
  IconSvgArrow,
  Tooltip,
  Table,
} from "@nfid-frontend/ui"

import {
  AssetPreview,
  NFTTransactions,
  TokenProperties,
} from "frontend/integration/nft/impl/nft-types"
import { NFT } from "frontend/integration/nft/nft"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

export interface NFTDetailsProps {
  nft: NFT
  about: string
  properties: TokenProperties
  transactions: NFTTransactions
  assetPreview: AssetPreview
  onTransferNFT: (e: MouseEvent<HTMLDivElement>) => void
  isAboutLoading: boolean
  isPreviewLoading: boolean
  isPropertiesLoading: boolean
  isTransactionsLoading: boolean
}

export const NFTDetails: FC<NFTDetailsProps> = ({
  onTransferNFT,
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
  console.log(
    "precc",
    nft,
    assetPreview,
    assetPreview.url,
    properties,
    transactions,
    about,
  )
  return (
    <ProfileTemplate
      pageTitle={nft.getTokenName()}
      titleClassNames="hidden sm:block"
      showBackButton
      headerMenu={
        <div className="flex items-center space-x-4">
          <Tooltip tip="Send">
            <div
              className={clsx(
                "p-[8px] rounded-[12px] cursor-pointer",
                "hover:bg-gray-100 active:bg-gray-200",
              )}
              onClick={onTransferNFT}
            >
              <img
                className="rotate-[135deg]"
                src={IconSvgArrow}
                alt="transfer"
              />
            </div>
          </Tooltip>
        </div>
      }
      className="w-full z-[1]"
    >
      <div
        className={clsx(
          "grid gap-[30px] max-w-[100vw] mb-[20px] sm:mb-[30px]",
          "grid-cols-1 lg:grid-cols-[auto,1fr]",
        )}
      >
        <div
          className={clsx(
            "relative overflow-hidden bg-gray-50 rounded-[24px] aspect-square",
            "lg:max-w-[445px] h-full lg:h-[445px]",
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
              className="w-full"
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
            id={
              trimConcat("nft_token_", nft.getTokenName()) +
              "_" +
              trimConcat("", nft.getCollectionId())
            }
          >
            {nft.getTokenName()}
          </p>
          <p
            className="font-bold text-primaryButtonColor leading-[24px] mb-[20px]"
            id={trimConcat("nft_collection_", nft.getCollectionId())}
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
              <p>EXT</p>
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
              <p id={`nft_id_${nft.getCollectionId().replace(/\s/g, "")}`}>
                {nft.getCollectionId()}
              </p>
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
                    <span className="block text-gray-400 text-xs">
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
                <tr className="text-gray-400 font-bold text-sm">
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
    </ProfileTemplate>
  )
}
