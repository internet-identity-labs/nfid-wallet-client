import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"
import { PRINCIPAL_LENGTH } from "packages/constants"
import { Token } from "packages/integration/src/lib/asset/types"
import { TransferFTUi } from "packages/ui/src/organisms/send-receive/components/send-ft"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import useSWR, { mutate } from "swr"

import {
  RootWallet,
  registerTransaction,
  sendReceiveTracking,
} from "@nfid/integration"
import { E8S } from "@nfid/integration/token/constants"
import { ICRC1Metadata } from "@nfid/integration/token/icrc1"

import { getVaultWalletByAddress } from "frontend/features/vaults/utils"
import { useProfile } from "frontend/integration/identity-manager/queries"
import { resetCachesByKey } from "frontend/ui/connnector/cache"
import {
  getAllTokensOptions,
  getConnector,
} from "frontend/ui/connnector/transfer-modal/transfer-factory"
import {
  ITransferResponse,
  TransferModalType,
} from "frontend/ui/connnector/transfer-modal/types"
import { ITransferConfig } from "frontend/ui/connnector/transfer-modal/types"
import { Blockchain } from "frontend/ui/connnector/types"

import { ITransferSuccess } from "./success"

interface ITransferFT {
  isVault: boolean
  preselectedTokenCurrency: string
  preselectedAccountAddress: string
  preselectedTokenBlockchain?: string
  preselectedTransferDestination?: string
  onTransferPromise: (data: ITransferSuccess) => void
}

export const TransferFT = ({
  isVault,
  preselectedTokenCurrency,
  preselectedAccountAddress = "",
  preselectedTokenBlockchain = Blockchain.IC,
  preselectedTransferDestination,
  onTransferPromise,
}: ITransferFT) => {
  const [selectedTokenCurrency, setSelectedTokenCurrency] = useState(
    preselectedTokenCurrency,
  )
  const [selectedTokenBlockchain, setSelectedTokenBlockchain] = useState(
    preselectedTokenBlockchain,
  )
  const [selectedAccountAddress, setSelectedAccountAddress] = useState(
    preselectedAccountAddress,
  )

  const [amountInUSD, setAmountInUSD] = useState(0)

  const { profile, isLoading: isLoadingProfile } = useProfile()
  console.debug("TransferFT", {
    profile,
    isLoadingProfile,
    selectedTokenBlockchain,
    selectedTokenCurrency,
  })

  const { data: selectedConnector, isLoading: isConnectorLoading } = useSWR(
    [selectedTokenCurrency, selectedTokenBlockchain, "selectedConnector"],
    ([selectedTokenCurrency, selectedTokenBlockchain]) =>
      getConnector({
        type: TransferModalType.FT,
        currency: selectedTokenCurrency,
        blockchain: selectedTokenBlockchain,
      }),
    {
      onSuccess: () => {
        refetchBalance()
      },
    },
  )

  const { data: tokenMetadata, isLoading: isMetadataLoading } = useSWR<
    ITransferConfig & (ICRC1Metadata | Token)
  >(
    selectedConnector
      ? [selectedConnector, "tokenMetadata", selectedTokenCurrency]
      : null,
    async ([selectedConnector]) => {
      // if it's icrc1 token, we need to fetch token metadata
      if (selectedConnector.getTokenMetadata)
        return await selectedConnector.getTokenMetadata(selectedTokenCurrency)
      else return selectedConnector.getTokenConfig()
    },
  )

  const {
    data: accountsOptions,
    isLoading: isAccountsLoading,
    isValidating: isAccountsValidating,
  } = useSWR(
    selectedConnector ? [selectedConnector, isVault, "accountsOptions"] : null,
    ([connector, isVault]) =>
      connector.getAccountsOptions({
        currency: selectedTokenCurrency,
        isVault,
        isRootOnly: true,
      }),
  )

  useEffect(() => {
    if (!accountsOptions?.length) return
    !preselectedAccountAddress.length &&
      setSelectedAccountAddress(accountsOptions[0].options[0].value)
  }, [accountsOptions, preselectedAccountAddress.length])

  const {
    data: balance,
    mutate: refetchBalance,
    isValidating: isBalanceFetching,
    isLoading: isBalanceLoading,
  } = useSWR(
    selectedConnector && selectedAccountAddress
      ? [selectedConnector, selectedAccountAddress, "balance"]
      : null,
    ([connector, selectedAccountAddress]) =>
      connector.getBalance(selectedAccountAddress, selectedTokenCurrency),
    { refreshInterval: 10000 },
  )

  const { data: tokenOptions, isLoading: isTokensLoading } = useSWR(
    [isVault, "getAllTokensOptions"],
    ([isVault]) => getAllTokensOptions(isVault),
  )

  const {
    register,
    getValues,
    formState: { errors },
    handleSubmit,
    setValue,
    resetField,
  } = useForm({
    mode: "all",
    defaultValues: {
      amount: undefined as any as string,
      to: preselectedTransferDestination ?? "",
    },
  })

  const {
    data: transferFee,
    mutate: calculateFee,
    isValidating: isFeeLoading,
  } = useSWR(
    selectedConnector && tokenMetadata
      ? [selectedConnector, getValues, tokenMetadata, "transferFee"]
      : null,
    ([selectedConnector, getValues, token]) =>
      selectedConnector?.getFee({
        amount: +getValues("amount"),
        to: getValues("to"),
        currency: selectedTokenCurrency,
        contract:
          "contractAddress" in token ? String(token.contractAddress) : "",
      }),
    {
      refreshInterval: 5000,
    },
  )

  const { data: decimals } = useSWR(
    selectedConnector ? [selectedTokenCurrency, "decimals"] : null,
    ([selectedTokenCurrency]) =>
      selectedConnector?.getDecimals(selectedTokenCurrency),
  )

  const { data: rate } = useSWR(
    selectedConnector ? [selectedTokenCurrency, "rate"] : null,
    ([selectedTokenCurrency]) =>
      selectedConnector?.getRate(selectedTokenCurrency),
  )

  const handleTrackTransfer = useCallback(
    (amount: string) => {
      const token = selectedConnector?.getTokenConfig()
      if (!token) return

      sendReceiveTracking.sendToken({
        network: token.blockchain,
        destinationType: "address",
        tokenName: selectedTokenCurrency,
        tokenType: "fungible",
        amount: amount,
        fee: Number(transferFee) ?? 0,
      })
    },
    [selectedConnector, selectedTokenCurrency, transferFee],
  )

  const submit = useCallback(
    async (values: { amount: string; to: string }) => {
      if (!tokenMetadata) return toast.error("Token metadata has not loaded")
      if (!selectedConnector) return toast.error("No selected connector")

      if (isVault) {
        return onTransferPromise({
          assetImg: tokenMetadata?.icon ?? "",
          initialPromise: new Promise(async (resolve) => {
            const wallet = await getVaultWalletByAddress(selectedAccountAddress)

            const address =
              values.to.length === PRINCIPAL_LENGTH
                ? AccountIdentifier.fromPrincipal({
                    principal: Principal.fromText(values.to),
                  }).toHex()
                : values.to

            await registerTransaction({
              address,
              amount: BigInt(Math.round(Number(values.amount) * E8S)),
              from_sub_account: wallet?.uid ?? "",
            })

            resolve({} as ITransferResponse)
          }),
          title: `${values.amount} ${selectedTokenCurrency}`,
          subTitle: `$${(Number(values.amount) * Number(rate)).toFixed(2)}`,
          callback: () => {
            resetCachesByKey(
              [
                `${selectedConnector.constructor.name}:getBalance:["${selectedAccountAddress}"]`,
                `${selectedConnector.constructor.name}:getBalance:["${values.to}"]`,
                `${selectedConnector.constructor.name}:getBalance:[]`,
                `${selectedConnector.constructor.name}:getAccountsOptions:["${selectedTokenCurrency}"]`,
              ],
              () => refetchBalance(),
            )
          },
          isAssetPadding: true,
        })
      }

      onTransferPromise({
        assetImg: tokenMetadata?.icon ?? "",
        initialPromise: new Promise(async (resolve) => {
          await calculateFee()
          const res = await selectedConnector.transfer({
            to: values.to,
            canisterId: tokenMetadata.canisterId,
            fee: transferFee!,
            amount:
              selectedTokenCurrency !== "ICP"
                ? +values.amount * 10 ** decimals!
                : +values.amount,
            currency: selectedTokenCurrency,
            identity: await selectedConnector?.getIdentity(
              selectedAccountAddress,
              tokenMetadata?.canisterId!,
            ),
            contract:
              "contractAddress" in tokenMetadata
                ? String(tokenMetadata.contractAddress)
                : "",
          })

          handleTrackTransfer(values.amount)
          resolve(res)
        }),
        title: `${Number(values.amount)
          .toFixed(decimals)
          .replace(/\.?0+$/, "")} ${selectedTokenCurrency}`,
        subTitle: `${(Number(values.amount) * Number(rate)).toFixed(2)} USD`,
        callback: () => {
          resetCachesByKey(
            [
              `${selectedConnector.constructor.name}:getBalance:["${selectedAccountAddress}"]`,
              `${selectedConnector.constructor.name}:getBalance:["${values.to}"]`,
              `${selectedConnector.constructor.name}:getBalance:[]`,
              `${selectedConnector.constructor.name}:getAccountsOptions:["${selectedTokenCurrency}"]`,
            ],
            () => refetchBalance(),
          )
          mutate(
            (key: any) =>
              key && Array.isArray(key) && key[0] === "useTokenConfig",
          )
        },
        isAssetPadding: true,
        duration: tokenMetadata.duration,
      })
    },
    [
      calculateFee,
      handleTrackTransfer,
      isVault,
      onTransferPromise,
      rate,
      refetchBalance,
      selectedAccountAddress,
      selectedConnector,
      selectedTokenCurrency,
      tokenMetadata,
      transferFee,
      decimals,
    ],
  )

  const loadingMessage = useMemo(() => {
    if (isLoadingProfile) return "Fetching account information..."
    if (isTokensLoading) return "Fetching supported tokens..."
    if (isConnectorLoading || isMetadataLoading)
      return "Loading token config..."
    if (isAccountsLoading || isAccountsValidating) return "Loading accounts..."
  }, [
    isLoadingProfile,
    isTokensLoading,
    isConnectorLoading,
    isMetadataLoading,
    isAccountsLoading,
    isAccountsValidating,
  ])

  return (
    <TransferFTUi
      isLoading={
        isConnectorLoading ||
        isAccountsLoading ||
        isAccountsValidating ||
        isMetadataLoading ||
        isTokensLoading
      }
      isBalanceLoading={isBalanceLoading && isBalanceFetching}
      loadingMessage={loadingMessage}
      balance={balance}
      rate={rate}
      decimals={decimals}
      transferFee={transferFee}
      calculateFee={calculateFee}
      selectedTokenCurrency={selectedTokenCurrency}
      preselectedTransferDestination={preselectedTransferDestination}
      tokenOptions={tokenOptions}
      tokenMetadata={tokenMetadata}
      selectedTokenBlockchain={selectedTokenBlockchain}
      sendReceiveTrackingFn={sendReceiveTracking.supportedTokenModalOpened}
      isVault={isVault}
      accountsOptions={accountsOptions}
      optionGroups={
        profile?.wallet === RootWallet.NFID ? [] : accountsOptions ?? []
      }
      isFeeLoading={isFeeLoading}
      selectedAccountAddress={selectedAccountAddress}
      submit={submit}
      setSelectedAccountAddress={setSelectedAccountAddress}
      selectedConnector={selectedConnector}
      amountInUSD={amountInUSD}
      setUSDAmount={(value) => setAmountInUSD(value)}
      setSelectedCurrency={(value) => setSelectedTokenCurrency(value)}
      setSelectedBlockchain={(value) => setSelectedTokenBlockchain(value)}
      register={register}
      errors={errors}
      handleSubmit={handleSubmit}
      setValue={setValue}
      resetField={resetField}
    />
  )
}
