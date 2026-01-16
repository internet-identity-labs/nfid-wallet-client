import clsx from "clsx"
import { FC, Fragment, useState } from "react"

import {
  IconNftPlaceholder,
  Table,
  ImageWithFallback,
  Skeleton,
  TableNftActivitySkeleton,
  IconCmpExternalIcon,
} from "@nfid-frontend/ui"
import { trimConcat } from "@nfid-frontend/utils"

import {
  AssetPreview,
  NFTTransactions,
  TokenProperties,
} from "frontend/integration/nft/impl/nft-types"
import { NFT } from "frontend/integration/nft/nft"

import { A } from "../../atoms/custom-link"
import ProfileContainer from "../../atoms/profile-container/Container"
import { ModalComponent } from "@nfid-frontend/ui"

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
  const marketPlaceLink = nft.getTokenMarketPlaceLink()

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
          onClick={() => {
            if (nft.getError()) return
            setIsModalOpen(true)
          }}
          className={clsx(
            "relative overflow-hidden bg-gray-50 dark:bg-zinc-700 rounded-[24px] aspect-square cursor-pointer",
            "lg:max-w-[445px] h-full lg:h-[445px] flex items-center justify-center",
          )}
        >
          {isPreviewLoading ? (
            <Skeleton className="rounded-[24px] h-full w-full" />
          ) : !assetPreview.url ? (
            <ImageWithFallback
              src={"#"}
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
              src={nft.getError() ? "#" : assetPreview.url}
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
            className="text-[28px] leading-[40px] mb-[8px] dark:text-white"
            id={`nft_token_${nft.getTokenName()}_${nft.getCollectionId()}`}
          >
            #{nft.getTokenNumber()}
          </p>
          <A
            href={nft.getCollectionMarketPlaceLink()}
            className="mb-[20px] font-bold leading-[24px]"
            id={`nft_collection_${nft.getCollectionId()}`}
            target="_blank"
          >
            {nft.getCollectionName() || nft.getCollectionId()}{" "}
          </A>
          <ProfileContainer
            title="Details"
            className="!px-[20px] !pt-[20px] sm:!px-[30px] sm:!pt-[20px] !pb-[7px] !m-0 flex-[100%] dark:text-white"
            innerClassName="!p-0"
            titleClassName="!p-0 mb-[20px]"
          >
            {nft.getError() ? (
              nft.getError()
            ) : (
              <>
                <div
                  className={clsx(
                    "min-h-[64px] sm:min-h-[54px] sm:border-b border-gray-100 dark:border-zinc-500",
                    "block sm:flex items-center dark:text-white",
                  )}
                >
                  <p className="text-sm text-gray-400 dark:text-zinc-500 flex-shrink-0 flex-grow-0 basis-[160px] mb-[5px]">
                    Standard
                  </p>
                  <p className="text-sm" id={"token-standard"}>
                    EXT
                  </p>
                </div>
                <div
                  className={clsx(
                    "min-h-[64px] sm:min-h-[54px] sm:border-b border-gray-100 dark:border-zinc-500",
                    "block sm:flex items-center dark:text-white",
                  )}
                >
                  <p className="text-sm text-gray-400 dark:text-zinc-500 flex-shrink-0 flex-grow-0 basis-[160px]">
                    ID
                  </p>
                  <p
                    className="text-sm"
                    id={`nft_id_${nft.getTokenId().replace(/\s/g, "")}`}
                  >
                    {nft.getTokenId()}
                  </p>
                </div>
                <div
                  className={clsx(
                    "min-h-[64px] sm:min-h-[54px] sm:border-b border-gray-100 dark:border-zinc-500",
                    "block sm:flex items-center dark:text-white",
                  )}
                >
                  <p className="text-sm text-gray-400 dark:text-zinc-500 flex-shrink-0 flex-grow-0 basis-[160px]">
                    Collection ID
                  </p>
                  <p className="text-sm" id={"collection-id"}>
                    {nft.getCollectionId()}
                  </p>
                </div>
                <div
                  className={clsx(
                    "min-h-[64px] sm:min-h-[54px] sm:border-b border-gray-100 dark:border-zinc-500",
                    "block sm:flex items-center dark:text-white",
                  )}
                >
                  <p className="text-sm text-gray-400 dark:text-zinc-500 flex-shrink-0 flex-grow-0 basis-[160px]">
                    Floor price
                  </p>
                  <p>
                    {!nft.getTokenFloorPriceIcpFormatted() ? (
                      <span>Unknown</span>
                    ) : (
                      <>
                        <span className="block text-sm">
                          {nft.getTokenFloorPriceIcpFormatted()}
                        </span>
                        <span className="block text-xs text-gray-400 dark:text-zinc-500">
                          {nft.getTokenFloorPriceUSDFormatted()}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <div
                  className={clsx(
                    "min-h-[64px] sm:min-h-[54px]",
                    "block sm:flex items-center dark:text-white",
                  )}
                >
                  <p className="text-sm text-gray-400 dark:text-zinc-500 flex-shrink-0 flex-grow-0 basis-[160px]">
                    View on a marketplace
                  </p>
                  <A
                    href={marketPlaceLink}
                    withGapBetweenChildren
                    target="_blank"
                  >
                    {marketPlaceLink}
                    <IconCmpExternalIcon className="mt-1" />
                  </A>
                </div>
              </>
            )}
          </ProfileContainer>
        </div>
      </div>
      {!nft.getError() && (
        <>
          <ProfileContainer
            className={clsx(
              "!p-[20px] sm:!p-[30px] mb-[20px] sm:mb-[30px] relative dark:text-white",
              !about && !isAboutLoading && "hidden",
            )}
            innerClassName="!p-0"
            titleClassName={clsx("!p-0", !isAboutLoading && "mb-[22px]")}
            title={!isAboutLoading && "About"}
          >
            {isAboutLoading ? (
              <>
                <Skeleton className="rounded-[24px] h-[24px] w-[180px] mb-[15px]" />
                <Skeleton className="rounded-[24px] h-[20px] w-[80px]" />
              </>
            ) : (
              <p id={"token-about"}>{about}</p>
            )}
          </ProfileContainer>
          <ProfileContainer
            className={clsx(
              "!p-[20px] sm:!p-[30px] mb-[20px] sm:mb-[30px] min-h-[250px] relative dark:text-white",
              (!properties.mappedValues || !properties.mappedValues.length) &&
                !isPropertiesLoading &&
                "hidden",
            )}
            innerClassName="!p-0"
            titleClassName={clsx("!p-0", !isPropertiesLoading && "mb-[22px]")}
            title={!isPropertiesLoading && "Properties"}
          >
            {isPropertiesLoading && (
              <Skeleton className="rounded-[24px] h-[24px] w-[180px] mb-[15px]" />
            )}
            <div
              className={clsx(
                "grid gap-[10px] max-w-[100vw]",
                "grid-cols-1 sm:grid-cols-3",
              )}
            >
              {isPropertiesLoading ? (
                <>
                  <Skeleton className="rounded-[24px] h-[62px] w-full" />
                  <Skeleton className="rounded-[24px] h-[62px] w-full" />
                  <Skeleton className="rounded-[24px] h-[62px] w-full" />
                  <Skeleton className="rounded-[24px] h-[62px] w-full" />
                  <Skeleton className="rounded-[24px] h-[62px] w-full" />
                  <Skeleton className="rounded-[24px] h-[62px] w-full" />
                </>
              ) : (
                properties.mappedValues &&
                properties.mappedValues.map((property) => {
                  return (
                    <div
                      key={`${property.category}_${property.option}`}
                      className="rounded-[12px] bg-gray-50 dark:bg-zinc-800 py-[9px] px-[20px] text-sm font-semibold"
                    >
                      <p className="leading-[22px] text-xs text-gray-400 dark:text-zinc-500">
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
              "!p-[20px] sm:!p-[30px] mb-[20px] sm:mb-[30px] relative dark:text-white",
              (!transactions.activity || !transactions.activity.length) &&
                !isTransactionsLoading &&
                "hidden",
            )}
            innerClassName="!p-0"
            titleClassName={clsx("!p-0", !isTransactionsLoading && "mb-[22px]")}
            title={!isTransactionsLoading && "Activity"}
          >
            <div className="max-w-[100%] overflow-auto">
              {isTransactionsLoading && (
                <Skeleton className="rounded-[24px] h-[24px] w-[180px] mb-[15px]" />
              )}
              <Table
                className="!min-w-[1050px] min-h-[100px]"
                theadClassName="!h-0 sm:!h-[40px]"
                id="nft-table"
                tableHeader={
                  <tr className="text-sm font-bold text-gray-400 dark:text-zinc-500">
                    <th className="w-[120px]">Event type</th>
                    <th className="w-[220px]">Date and time</th>
                    <th>From</th>
                    <th>To</th>
                    <th className="w-[100px]">Price</th>
                  </tr>
                }
              >
                {isTransactionsLoading ? (
                  <TableNftActivitySkeleton
                    tableRowsAmount={2}
                    tableCellAmount={5}
                  />
                ) : (
                  transactions.activity &&
                  transactions.activity.map((activity) => {
                    const price = activity
                      .getTransactionView()
                      .getFormattedPrice()

                    return (
                      <Fragment
                        key={`${activity
                          .getTransactionView()
                          .getFrom()}_${activity
                          .getTransactionView()
                          .getFormattedDate()}`}
                      >
                        <tr className="text-sm h-[60px] dark:text-white">
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
                            {price ? (
                              <>
                                <span className="block">{price}</span>
                                <span className="block text-xs text-gray-400 dark:text-zinc-500">
                                  {activity
                                    .getTransactionView()
                                    .getFormattedUsdPrice()}
                                </span>
                              </>
                            ) : (
                              "Unknown"
                            )}
                          </td>
                        </tr>
                      </Fragment>
                    )
                  })
                )}
              </Table>
            </div>
          </ProfileContainer>
        </>
      )}
    </>
  )
}
