import { useActor } from "@xstate/react"
import clsx from "clsx"
import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
import { useCallback, useContext } from "react"
import { trimConcat } from "src/ui/atoms/util/util"

import { Loader, Tooltip } from "@nfid-frontend/ui"
import { Application, getWalletName } from "@nfid/integration"

import { ITransaction } from "frontend/apps/identity-manager/profile/nft-details/utils"
import { UserNonFungibleToken } from "frontend/features/non-fungible-token/types"
import { link } from "frontend/integration/entrepot"
import { ProfileContext } from "frontend/provider"
import { Copy } from "frontend/ui/atoms/copy"
import Table from "frontend/ui/atoms/table"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import TransferIcon from "./assets/transfer.svg"
import WalletIcon from "./assets/wallet.svg"

import { NFTAsset } from "./nft-asset"

interface IProfileNFTDetails {
  nft: UserNonFungibleToken
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
  const globalServices = useContext(ProfileContext)
  const [, send] = useActor(globalServices.transferService)

  const onTransferNFT = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault()

      send({ type: "ASSIGN_SELECTED_NFT", data: nft.tokenId })
      send({ type: "CHANGE_TOKEN_TYPE", data: "nft" })
      send({ type: "CHANGE_DIRECTION", data: "send" })

      send("SHOW")
    },
    [nft, send],
  )

  return (
    <ProfileTemplate
      showBackButton
      headerMenu={
        <div className="flex items-center space-x-4">
          <Tooltip tip="Transfer">
            <img
              className="transition-opacity cursor-pointer hover:opacity-50"
              src={TransferIcon}
              alt="transfer"
              onClick={onTransferNFT}
            />
          </Tooltip>
          <Copy
            value={
              nft.blockchain === "Internet Computer"
                ? link(nft.collection.id, Number(nft.index))
                : nft.assetFullsize.url
            }
          />
        </div>
      }
      className="w-full z-[1]"
    >
      <div
        className={clsx(
          "grid gap-[30px] max-w-[100vw]",
          "grid-cols-1 sm:grid-cols-[auto,1fr]",
        )}
      >
        <div className="relative overflow-hidden bg-gray-50 rounded-xl h-full md:h-[342px] aspect-square">
          <div
            style={{
              backgroundImage: `url(${nft.assetPreview})`,
            }}
            className={clsx(
              "bg-cover bg-center bg-no-repeat blur-md brightness-150",
              "h-full absolute z-10 w-full opacity-70",
              (nft.assetFullsize.format === "video" ||
                nft.assetFullsize.format === "iframe") &&
                "hidden",
            )}
          />
          <NFTAsset
            url={nft.assetFullsize.url}
            format={nft.assetFullsize.format}
          />
        </div>
        <div
          id={
            trimConcat("nft_token_", nft.name) +
            "_" +
            trimConcat("", nft.collection.id)
          }
        >
          <p
            className="font-bold text-blue"
            id={trimConcat("nft_collection_", nft.collection.id)}
          >
            {nft.collection.name}
          </p>
          <p
            className="text-[28px] mt-2.5"
            id={
              trimConcat("nft_token_", nft.name) +
              "_" +
              trimConcat("", nft.collection.id)
            }
          >
            {nft.name}
          </p>
          {"account" in nft ? (
            <div className="flex items-center mt-4 space-x-2">
              <img src={WalletIcon} alt="wallet" />
              <p
                className="text-sm font-semibold text-secondary"
                id={`nft_wallet_${
                  nft?.walletName === "NFID"
                    ? "NFIDWallet"
                    : nft.walletName?.split(" ").join("") ??
                      getWalletName(
                        applications,
                        nft?.principal?.toString() ?? "",
                        nft.account.accountId,
                      )
                        .split(" ")
                        .join("")
                }`}
              >
                {nft?.walletName === "NFID"
                  ? "NFID Wallet"
                  : nft?.walletName ??
                    getWalletName(
                      applications,
                      nft?.principal?.toString() ?? "",
                      nft.account.accountId,
                    )}
              </p>
            </div>
          ) : null}
          <ProfileContainer title="Details" className="mt-6">
            <div className="mt-5 space-y-4 text-sm">
              <div
                className={clsx(
                  "grid grid-cols-1 sm:grid-cols-[100px,1fr] gap-5",
                )}
              >
                <p className="mb-1 text-secondary">Blockchain</p>
                <p className={clsx("w-full")} id={"nft_blockchain_"}>
                  {nft.blockchain}
                </p>

                <p className="mb-1 text-secondary">Standard</p>
                <p id={"token-standard"} className={clsx("w-full")}>
                  {nft.collection.standard === "legacy"
                    ? "Legacy EXT"
                    : nft.collection.standard}
                </p>

                <p className="mb-1 text-secondary">NFT ID</p>
                <p
                  id={`nft_id_${nft.tokenId.replace(/\s/g, "")}`}
                  className="w-full overflow-hidden"
                >
                  {nft.tokenId}
                </p>

                <p className="mb-1 text-secondary">Collection ID</p>
                <p id={"collection-id"} className="w-full overflow-hidden">
                  {nft.contractId}
                </p>
              </div>
            </div>
          </ProfileContainer>
        </div>
      </div>
      <div className={clsx("mt-[30px] max-w-[100vw]")}>
        <ProfileContainer title="About">
          <p id={"token-about"} className="text-sm">
            {nft.collection.description.length
              ? nft.collection.description
              : "No description"}
          </p>
        </ProfileContainer>
      </div>
      <div
        className={clsx(
          "w-full",
          "border border-gray-200 rounded-xl",
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
            key: `${transaction.from}${transaction.to}${transaction.datetime}${transaction.type}`,
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
