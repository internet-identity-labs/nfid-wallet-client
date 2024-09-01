import { AccountIdentifier } from "@dfinity/ledger-icp"
import { decodeIcrcAccount } from "@dfinity/ledger-icrc"
import { Principal } from "@dfinity/principal"
import { PRINCIPAL_LENGTH } from "packages/constants"
import { TransferFTUi } from "packages/ui/src/organisms/send-receive/components/send-ft"
import {
  fetchAllTokens,
  fetchTokenByAddress,
} from "packages/ui/src/organisms/tokens/utils"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import useSWR, { mutate } from "swr"

import { BlurredLoader, Loader } from "@nfid-frontend/ui"
import {
  RootWallet,
  registerTransaction,
  sendReceiveTracking,
} from "@nfid/integration"
import { E8S, ICP_CANISTER_ID } from "@nfid/integration/token/constants"
import { transfer as transferICP } from "@nfid/integration/token/icp"
import { transferICRC1 } from "@nfid/integration/token/icrc1"
import { ICRC1Metadata } from "@nfid/integration/token/icrc1/types"

import { getVaultWalletByAddress } from "frontend/features/vaults/utils"
import { FT } from "frontend/integration/ft/ft"
import { useProfile } from "frontend/integration/identity-manager/queries"
import { stringICPtoE8s } from "frontend/integration/wallet/utils"
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

import {
  getIdentity,
  getVaultsAccountsOptions,
  validateAddress,
} from "../utils"
import { ITransferSuccess } from "./success"

interface ITransferFT {
  isVault: boolean
  preselectedAccountAddress: string
  onTransferPromise: (data: ITransferSuccess) => void
  publicKey: string
}

export const TransferFT = ({
  isVault,
  preselectedAccountAddress = "",
  onTransferPromise,
  publicKey,
}: ITransferFT) => {
  const [tokenAddress, setTokenAddress] = useState(ICP_CANISTER_ID)
  const [amountInUSD, setAmountInUSD] = useState(0)
  const { data: activeTokens = [], isLoading: isActiveTokensLoading } = useSWR(
    "activeTokens",
    fetchAllTokens,
  )

  const { data: token, isLoading: isTokenLoading } = useSWR(
    tokenAddress ? ["token", tokenAddress] : null,
    ([, address]) => fetchTokenByAddress(address),
  )

  const { data: usdRate, isLoading: isRateLoading } = useSWR(
    token ? ["tokenRate", token.getTokenAddress(), amountInUSD] : null,
    ([_, __, amount]) => token?.getTokenRate(amount.toString()),
  )

  console.log("dattt", token)

  const [selectedVaultsAccountAddress, setSelectedVaultsAccountAddress] =
    useState(preselectedAccountAddress)

  //const [amountInUSD, setAmountInUSD] = useState(0)

  const { profile, isLoading: isLoadingProfile } = useProfile()

  // TODO: adjust accountsOptions for Vaults
  const { data: vaultsAccountsOptions = [], isLoading } = useSWR(
    "vaultsAccountsOptions",
    getVaultsAccountsOptions,
  )

  // useEffect(() => {
  //   if (!accountsOptions?.length) return
  //   !preselectedAccountAddress.length &&
  //     setSelectedAccountAddress(accountsOptions[0].options[0].value)
  // }, [accountsOptions, preselectedAccountAddress.length])

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
      to: "",
    },
  })

  const handleTrackTransfer = useCallback(
    (amount: string) => {
      if (!token) return

      sendReceiveTracking.sendToken({
        destinationType: "address",
        tokenName: token.getTokenName(),
        tokenType: "fungible",
        amount: amount,
        fee: token.getTokenFee()?.toString() ?? 0,
      })
    },
    [token],
  )

  const submit = useCallback(
    async (values: { amount: string; to: string }) => {
      if (!token) return toast.error("No selected token")

      if (isVault) {
        return onTransferPromise({
          assetImg: token.getTokenLogo() ?? "",
          initialPromise: new Promise(async (resolve) => {
            const wallet = await getVaultWalletByAddress(
              selectedVaultsAccountAddress,
            )

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
          title: `${values.amount} ${token.getTokenSymbol()}`,
          // don't know
          subTitle: `123`,
          //subTitle: `$${(Number(values.amount) * Number(rate)).toFixed(2)}`,
          isAssetPadding: true,
        })
      }

      onTransferPromise({
        assetImg: token?.getTokenLogo() ?? "",
        initialPromise: new Promise(async (resolve) => {
          const { owner, subaccount } = decodeIcrcAccount(values.to)
          const identity = await getIdentity([token!.getTokenAddress()])
          let res
          if (!token) return
          try {
            if (token?.getTokenAddress() === ICP_CANISTER_ID) {
              console.log(
                "icppp",
                values.amount,
                stringICPtoE8s(String(values.amount)),
              )
              res = await transferICP({
                amount: stringICPtoE8s(String(values.amount)),
                to: values.to,
                identity: identity,
              })
            } else {
              const fee = await token.getTokenFee()
              res = await transferICRC1(identity, token.getTokenAddress(), {
                to: {
                  subaccount: subaccount ? [subaccount] : [],
                  owner,
                },
                amount: BigInt(
                  Number(values.amount) * 10 ** token?.getTokenDecimals()!,
                ),
                memo: [],
                fee: [fee!.raw],
                from_subaccount: [],
                created_at_time: [],
              })

              setAmountInUSD(Number(values.amount))
            }

            handleTrackTransfer(values.amount)
            resolve({ hash: String(res) })
          } catch (e) {
            throw new Error(
              `Transfer error: ${
                (e as Error).message ? (e as Error).message : e
              }`,
            )
          }
        }),
        title: `${Number(values.amount)
          .toFixed(token?.getTokenDecimals())
          .replace(/\.?0+$/, "")} ${token?.getTokenSymbol()}`,
        //subTitle: `123`,
        subTitle: usdRate!.formatted,
        isAssetPadding: true,
        //duration: tokenMetadata.duration,
      })
    },
    [handleTrackTransfer, isVault, onTransferPromise, token],
  )

  // const loadingMessage = useMemo(() => {
  //   if (isLoadingProfile) return "Fetching account information..."
  //   if (isTokensLoading) return "Fetching supported tokens..."
  //   if (isConnectorLoading || isMetadataLoading)
  //     return "Loading token config..."
  //   if (isAccountsLoading || isAccountsValidating) return "Loading accounts..."
  // }, [
  //   isLoadingProfile,
  //   isTokensLoading,
  //   isConnectorLoading,
  //   isMetadataLoading,
  //   isAccountsLoading,
  //   isAccountsValidating,
  // ])

  if (!token) return <BlurredLoader isLoading />

  return (
    <TransferFTUi
      publicKey={publicKey}
      token={token}
      tokens={activeTokens}
      setChosenToken={setTokenAddress}
      validateAddress={validateAddress}
      // isLoading={
      //   isConnectorLoading ||
      //   isAccountsLoading ||
      //   isAccountsValidating ||
      //   isMetadataLoading ||
      //   isTokensLoading
      // }
      isLoading={isActiveTokensLoading}
      sendReceiveTrackingFn={sendReceiveTracking.supportedTokenModalOpened}
      isVault={isVault}
      selectedVaultsAccountAddress={selectedVaultsAccountAddress}
      submit={submit}
      setSelectedVaultsAccountAddress={setSelectedVaultsAccountAddress}
      //amountInUSD={amountInUSD}
      //setUSDAmount={(value) => setAmountInUSD(value)}
      register={register}
      errors={errors}
      handleSubmit={handleSubmit}
      setValue={setValue}
      resetField={resetField}
      ////////////////////////////
      loadingMessage={"Fetching supported tokens..."}
      tokenOptions={tokenOptions}
      accountsOptions={vaultsAccountsOptions}
      optionGroups={
        profile?.wallet === RootWallet.NFID ? [] : vaultsAccountsOptions ?? []
      }
    />
  )
}
