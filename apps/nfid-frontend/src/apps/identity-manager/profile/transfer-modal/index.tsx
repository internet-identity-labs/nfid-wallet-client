import { Principal } from "@dfinity/principal"
import clsx from "clsx"
import { fromHexString, principalToAddress } from "ictool"
import { useAtom } from "jotai"
import { useState } from "react"
import React from "react"
import { toast } from "react-toastify"
import { mutate } from "swr"

import {
  ITransferToken,
  ITransferNFT,
  TransferModal,
  transferModalAtom,
} from "@nfid-frontend/ui"
import {
  registerTransaction,
  TransactionRegisterOptions,
} from "@nfid/integration"
import { toPresentation } from "@nfid/integration/token/icp"

import { useUserBalances } from "frontend/features/fungable-token/icp/hooks/use-user-balances"
import { useAllToken } from "frontend/features/fungable-token/use-all-token"
import { transferEXT } from "frontend/integration/entrepot/ext"
import { getWalletDelegation } from "frontend/integration/facade/wallet"
import { useProfile } from "frontend/integration/identity-manager/queries"
import { useAllWallets } from "frontend/integration/wallet/hooks/use-all-wallets"
import { useTransfer } from "frontend/integration/wallet/hooks/use-transfer"
import {
  e8sICPToString,
  stringICPtoE8s,
} from "frontend/integration/wallet/utils"
import { Loader } from "frontend/ui/atoms/loader"

import { useAllNFTs } from "../assets/hooks"
import { ProfileConstants } from "../routes"
import { transformToAddress } from "./transform-to-address"

declare const VAULT_CANISTER_ID: string

export const ProfileTransferModal = () => {
  const { refreshBalances } = useUserBalances()
  const [transferModalState, setTransferModalState] = useAtom(transferModalAtom)

  const [successMessage, setSuccessMessage] = useState("")
  const [selectedWalletId, setSelectedWalletId] = useState("")
  const [selectedTokenValue, setSelectedTokenValue] = useState("")

  const { token } = useAllToken()
  const tokenOptions = React.useMemo(
    () =>
      token.map((t) => ({
        label: t.title,
        value: t.currency,
        icon: t.icon,
        fee: t.fee,
        toPresentation: t.toPresentation,
        transformAmount: t.transformAmount,
        tokenCanisterId: t.canisterId,
        tokenStandard: t.tokenStandard,
      })),
    [token],
  )
  const selectedToken = React.useMemo(
    () =>
      tokenOptions.find((option) => option.value === selectedTokenValue) ||
      tokenOptions[0],
    [tokenOptions, selectedTokenValue],
  )
  console.debug("", {
    selectedToken,
    transferFee: selectedToken?.toPresentation(selectedToken.fee),
  })

  const { transfer } = useTransfer({
    accountId: transferModalState.selectedWallet.accountId,
    domain: transferModalState.selectedWallet.domain,
    transformAmount: selectedToken.transformAmount,
    tokenCanisterId: selectedToken.tokenCanisterId,
  })
  const { wallets } = useAllWallets()
  const { nfts } = useAllNFTs()
  const { profile } = useProfile()
  const [isLoading, setIsLoading] = useState(false)

  const walletOptions = React.useMemo(() => {
    console.log({ wallets })
    return wallets?.map((wallet) => ({
      label: wallet.label ?? "",
      value: !wallet.isVaultWallet
        ? wallet.principal?.toText() ?? ""
        : wallet.accountId,
      afterLabel: `${toPresentation(wallet.balance[selectedToken.value])} ${
        selectedToken.value
      }`,
    }))
  }, [selectedToken, wallets])

  const submitVaultWallet = React.useCallback(
    async (data: TransactionRegisterOptions) => {
      try {
        setIsLoading(true)
        await registerTransaction(data)
        setSuccessMessage(
          `You've requested ${e8sICPToString(
            Number(data.amount),
          )} ICP from the vault wallet`,
        )
      } catch (e) {
        console.log({ e })
        toast.error("Unexpected error: The transaction has been cancelled", {
          toastId: "unexpectedTransferError",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const onTokenSubmit = async (values: ITransferToken) => {
    const validAddress = transformToAddress(
      values.to,
      selectedToken.tokenStandard,
    )

    if (
      principalToAddress(transferModalState.selectedWallet.principal as any) ===
      validAddress
    )
      return toast.error("You cannot send tokens to the same wallet", {
        toastId: "sameWalletError",
      })

    if (
      transferModalState.selectedWallet.principal?.toString() ===
      VAULT_CANISTER_ID
    )
      return submitVaultWallet({
        address: principalToAddress(
          Principal.fromText(VAULT_CANISTER_ID),
          fromHexString(transferModalState.selectedWallet.accountId),
        ),
        amount: BigInt(stringICPtoE8s(String(values.amount))),
        from_sub_account: transferModalState.selectedWallet.accountId,
      })

    try {
      setIsLoading(true)
      await transfer(validAddress, String(values.amount))
      refreshBalances()
      setSuccessMessage(`${values.amount} ${selectedToken.value} was sent`)
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

  const handleSelectWallet = React.useCallback(
    (walletId: string) => {
      const wallet = wallets?.find(
        (wallet) =>
          wallet.principal.toString() === walletId ||
          wallet.accountId === walletId,
      )
      if (wallet) {
        setSelectedWalletId(walletId)
        setTransferModalState({
          ...transferModalState,
          selectedWallet: wallet,
        })
      }
    },
    [setTransferModalState, transferModalState, wallets],
  )

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
        transactionRoute={`${ProfileConstants.base}/${ProfileConstants.transactions}`}
        tokenType={transferModalState.sendType}
        tokenConfig={selectedToken}
        toggleTokenType={() =>
          setTransferModalState({
            ...transferModalState,
            sendType: transferModalState.sendType === "ft" ? "nft" : "ft",
          })
        }
        nfts={nfts ?? []}
        wallets={wallets}
        walletOptions={walletOptions}
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
        setSelectedNFTs={(nftIds: string[]): void => {
          console.debug("setSelectedNFTs", { nftIds })
          setTransferModalState({
            ...transferModalState,
            selectedNFT: nftIds,
          })
        }}
        selectedNFTIds={transferModalState.selectedNFT}
        selectedNFTDetails={nfts?.find(
          (nft) => nft.tokenId === transferModalState.selectedNFT[0],
        )}
        onSelectWallet={handleSelectWallet}
        selectedWalletId={selectedWalletId}
        onSelectToken={setSelectedTokenValue}
        tokenOptions={tokenOptions}
        selectedToken={selectedToken}
      />
    </div>
  )
}
