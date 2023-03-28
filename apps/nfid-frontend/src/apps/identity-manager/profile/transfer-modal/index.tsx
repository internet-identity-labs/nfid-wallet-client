import clsx from "clsx"
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
  modalTypes,
  IGroupedOptions,
} from "@nfid-frontend/ui"
import { groupArrayByField, truncateString } from "@nfid-frontend/utils"
import {
  ecdsaSigner,
  ethereumAsset,
  registerTransaction,
  replaceActorIdentity,
  TransactionRegisterOptions,
} from "@nfid/integration"
import { toPresentation } from "@nfid/integration/token/icp"

import { toUSD } from "frontend/features/fungable-token/accumulate-app-account-balances"
import { useExchangeRates } from "frontend/features/fungable-token/eth/hooks/use-eth-exchange-rate"
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

export const ProfileTransferModal = () => {
  const [transferModalState, setTransferModalState] = useAtom(transferModalAtom)
  const { profile } = useProfile()
  const { rates } = useExchangeRates(["ICP", "BTC", "ETH"])

  const [successMessage, setSuccessMessage] = useState("")
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
  const { refreshBalances } = useUserBalances()
  const { wallets } = useAllWallets()

  const { nfts } = useAllNFTs()
  const [isLoading, setIsLoading] = useState(false)

  const walletOptions: IGroupedOptions[] = React.useMemo(() => {
    if (!wallets) return []

    const formattedOptions = wallets.map((wallet) => ({
      title: wallet.label ?? "",
      value: wallet.isVaultWallet
        ? wallet.address ?? ""
        : wallet.principal?.toText(),
      subTitle: truncateString(wallet.principalId, 5),
      innerTitle: `${toPresentation(wallet.balance[selectedToken.value])} ${
        selectedToken.value
      }`,
      innerSubtitle: toUSD(
        toPresentation(wallet.balance[selectedToken.value]),
        rates[selectedToken.value],
      ),
      isVaultWallet: wallet.isVaultWallet,
      vaultId: wallet.vaultId,
      vaultName: wallet.vaultName,
    }))

    const publicWallets = formattedOptions.filter((w) => !w.isVaultWallet)
    const vaultWallets = formattedOptions.filter((w) => w.isVaultWallet)
    const vaultGroups = groupArrayByField(vaultWallets, "vaultId").map(
      (group) => ({
        label: group[0]?.vaultName,
        options: group,
      }),
    )

    if (selectedToken.value === "ETH" || selectedToken.value === "BTC")
      return [{ label: "Public", options: publicWallets.slice(0, 1) }]

    return [
      {
        label: "Public",
        options: publicWallets,
      },
      ...vaultGroups,
    ] as IGroupedOptions[]
  }, [rates, selectedToken.value, wallets])

  const submitVaultWallet = React.useCallback(
    async (data: TransactionRegisterOptions) => {
      try {
        setIsLoading(true)
        await registerTransaction(data)
        setTransferModalState({ ...transferModalState, modalType: "Success" })
        setSuccessMessage(
          `You've requested ${e8sICPToString(
            Number(data.amount),
          )} ICP from the vault`,
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
    [setTransferModalState, transferModalState],
  )

  const submitETH = React.useCallback(
    async (values: ITransferToken) => {
      try {
        setIsLoading(true)
        const identity = await getWalletDelegation(
          profile?.anchor ?? 0,
          "nfid.one",
          "account 1",
        )
        await replaceActorIdentity(ecdsaSigner, identity)
        const res = await ethereumAsset.transferETH(
          values.to,
          String(values.amount),
        )
        console.log("transfer ETH", res)
        setTransferModalState({ ...transferModalState, modalType: "Success" })
        setSuccessMessage(`You've sent ${values.amount} ETH`)
        await refreshBalances()
      } catch (e) {
        console.log({ e })
        toast.error("Unexpected error: The transaction has been cancelled", {
          toastId: "unexpectedTransferError",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [
      profile?.anchor,
      refreshBalances,
      setTransferModalState,
      transferModalState,
    ],
  )

  const onTokenSubmit = async (values: ITransferToken) => {
    if (selectedToken.value === "ETH") return submitETH(values)

    const validAddress = transformToAddress(
      values.to,
      selectedToken.tokenStandard,
    )

    if (transferModalState.selectedWallets[0] === validAddress)
      return toast.error("You cannot send tokens to the same wallet", {
        toastId: "sameWalletError",
      })

    if (
      transferModalState.selectedWallet.principal?.toString() ===
      VAULT_CANISTER_ID
    )
      return submitVaultWallet({
        address: validAddress,
        amount: BigInt(stringICPtoE8s(String(values.amount))),
        from_sub_account: transferModalState.selectedWallet.accountId,
      })

    try {
      setIsLoading(true)
      await transfer(validAddress, String(values.amount))
      refreshBalances()
      setSuccessMessage(`${values.amount} ${selectedToken.value} was sent`)
      setTransferModalState({ ...transferModalState, modalType: "Success" })
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
          wallet.address === walletId,
      )
      if (wallet) {
        setTransferModalState({
          ...transferModalState,
          selectedWallet: wallet,
          selectedWallets: [walletId],
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

  React.useEffect(() => {
    if (!transferModalState.selectedWallets.length && walletOptions.length)
      handleSelectWallet(walletOptions[0].options[0]?.value)
  }, [
    handleSelectWallet,
    setTransferModalState,
    transferModalState,
    walletOptions,
  ])

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
      {/* <TransferModal
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
          setTransferModalState({
            ...transferModalState,
            isModalOpen: false,
            modalType: "Send",
          })
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
        selectedWalletId={transferModalState.selectedWallets[0]}
        onSelectToken={(value: string) => {
          setSelectedTokenValue(value)
          handleSelectWallet(walletOptions[0].options[0]?.value)
        }}
        tokenOptions={tokenOptions}
        selectedToken={selectedToken}
        modalType={transferModalState.modalType}
        setModalType={(value: modalTypes) =>
          setTransferModalState({ ...transferModalState, modalType: value })
        }
      /> */}
    </div>
  )
}
