import { Principal } from "@dfinity/principal"
import clsx from "clsx"
import { principalToAddress } from "ictool"
import { useAtom } from "jotai"
import { useState } from "react"
import { toast } from "react-toastify"
import { mutate } from "swr"

import { getWalletDelegation } from "frontend/integration/facade/wallet"
import { useProfile } from "frontend/integration/identity-manager/queries"
import { useAllWallets } from "frontend/integration/wallet/hooks/use-all-wallets"
import { useTransfer } from "frontend/integration/wallet/hooks/use-transfer"
import { Loader } from "frontend/ui/atoms/loader"
import { TransferModal } from "frontend/ui/organisms/transfer-modal"
import { ITransferNFT } from "frontend/ui/organisms/transfer-modal/send/send-nft"
import { ITransferToken } from "frontend/ui/organisms/transfer-modal/send/send-token"
import { isHex } from "frontend/ui/utils"

import { useAllNFTs } from "../assets/hooks"
import { transferModalAtom } from "./state"
import { transferEXT } from "frontend/integration/entrepot/ext"

export const ProfileTransferModal = () => {
  const [transferModalState, setTransferModalState] = useAtom(transferModalAtom)

  const [successMessage, setSuccessMessage] = useState("")
  const { transfer } = useTransfer({
    accountId: transferModalState.selectedWallet.accountId,
    domain: transferModalState.selectedWallet.domain,
  })
  const { wallets } = useAllWallets()
  const { data: nfts } = useAllNFTs()
  const { profile } = useProfile()
  const [isLoading, setIsLoading] = useState(false)

  const onTokenSubmit = async (values: ITransferToken) => {
    let validAddress = isHex(values.to)
      ? values.to
      : principalToAddress(Principal.fromText(values.to) as any)

    try {
      setIsLoading(true)
      await transfer(validAddress, String(values.amount))
      setSuccessMessage(`${values.amount} ICP was sent`)
    } catch (e: any) {
      if (e.message === "InsufficientFunds")
        toast.error("You don't have enough ICP for this transaction", {
          toastId: "insufficientFundsError",
        })
      else
        toast.error("Unexpected error: The transaction has been cancelled", {
          toastId: "unexpectedTransferError",
        })
      console.log({ e })
    } finally {
      mutate("walletBalance")
      setIsLoading(false)
    }
  }

  const onNFTSubmit = async (values: ITransferNFT) => {
    if (!profile?.anchor) throw new Error("No profile anchor")
    setIsLoading(true)

    const nftDetails = nfts?.find((nft) => nft.tokenId === values.tokenId)

    const identity = await getWalletDelegation(
      profile?.anchor,
      nftDetails?.account.domain,
      nftDetails?.account.accountId,
    )

    try {
      await transferEXT(values.tokenId, identity, values.to)
      setSuccessMessage(`${nftDetails?.name} was sent`)
    } catch (e: any) {
      toast.error("Unexpected error: The transaction has been cancelled", {
        toastId: "unexpectedTransferError",
      })
      console.log({ e })
    } finally {
      setTimeout(() => {
        mutate("userTokens")
      }, 1000)
      setIsLoading(false)
    }
  }
  return (
    <div
      className={clsx([
        "transition ease-in-out delay-150 duration-300",
        "z-40 top-0 left-0 w-full h-screen",
        "fixed bg-opacity-75 bg-gray-600",
      ])}
      style={{ margin: 0 }}
      onClick={() =>
        setTransferModalState({ ...transferModalState, isModalOpen: false })
      }
    >
      <Loader isLoading={isLoading} />
      <TransferModal
        nfts={nfts ?? []}
        wallets={wallets}
        onTokenSubmit={onTokenSubmit}
        onNFTSubmit={onNFTSubmit}
        onClose={() => {
          setTransferModalState({ ...transferModalState, isModalOpen: false })
          setSuccessMessage("")
          setTimeout(() => {
            mutate("walletBalance")
            mutate("userTokens")
          }, 500)
        }}
        successMessage={successMessage}
      />
    </div>
  )
}
