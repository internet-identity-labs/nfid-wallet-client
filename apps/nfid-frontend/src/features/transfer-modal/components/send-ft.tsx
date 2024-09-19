import { AccountIdentifier } from "@dfinity/ledger-icp"
import { decodeIcrcAccount } from "@dfinity/ledger-icrc"
import { Principal } from "@dfinity/principal"
import { PRINCIPAL_LENGTH } from "packages/constants"
import { resetIntegrationCache } from "packages/integration/src/cache"
import { TransferFTUi } from "packages/ui/src/organisms/send-receive/components/send-ft"
import {
  fetchActiveTokens,
  fetchActiveTokenByAddress,
} from "packages/ui/src/organisms/tokens/utils"
import { useCallback, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import useSWR from "swr"

import {
  RootWallet,
  registerTransaction,
  sendReceiveTracking,
} from "@nfid/integration"
import { E8S, ICP_CANISTER_ID } from "@nfid/integration/token/constants"
import { transfer as transferICP } from "@nfid/integration/token/icp"
import { transferICRC1 } from "@nfid/integration/token/icrc1"

import { useAllVaultsWallets } from "frontend/features/vaults/hooks/use-vaults-wallets-balances"
import { getVaultWalletByAddress } from "frontend/features/vaults/utils"
import { useProfile } from "frontend/integration/identity-manager/queries"
import { stringICPtoE8s } from "frontend/integration/wallet/utils"
import { ITransferResponse } from "frontend/ui/connnector/transfer-modal/types"

import {
  getAccountIdentifier,
  getIdentity,
  getVaultsAccountsOptions,
  validateICPAddress,
  validateICRC1Address,
} from "../utils"
import { ITransferSuccess } from "./success"

interface ITransferFT {
  preselectedTokenAddress: string | undefined
  isVault: boolean
  preselectedAccountAddress: string
  onTransferPromise: (data: ITransferSuccess) => void
}

export const TransferFT = ({
  isVault,
  preselectedTokenAddress = ICP_CANISTER_ID,
  preselectedAccountAddress = "",
  onTransferPromise,
}: ITransferFT) => {
  const [tokenAddress, setTokenAddress] = useState(preselectedTokenAddress)
  const [amountInUSD, setAmountInUSD] = useState(0)
  const {
    data: activeTokens = [],
    isLoading: isActiveTokensLoading,
    mutate: refetchActiveTokens,
  } = useSWR("activeTokens", fetchActiveTokens)

  const {
    data: token,
    isLoading: isTokenLoading,
    mutate: refetchToken,
  } = useSWR(tokenAddress ? ["token", tokenAddress] : null, ([, address]) =>
    fetchActiveTokenByAddress(address),
  )

  const { data: usdRate } = useSWR(
    token ? ["tokenRate", token.getTokenAddress(), amountInUSD] : null,
    ([_, __, amount]) => token?.getTokenRateFormatted(amount.toString()),
  )

  const [selectedVaultsAccountAddress, setSelectedVaultsAccountAddress] =
    useState(preselectedAccountAddress)

  const { balances } = useAllVaultsWallets()

  const balance = useMemo(() => {
    return balances?.find(
      (balance) => balance.address === selectedVaultsAccountAddress,
    )
  }, [selectedVaultsAccountAddress, balances])

  const { profile } = useProfile()

  const { data: vaultsAccountsOptions = [] } = useSWR(
    "vaultsAccountsOptions",
    getVaultsAccountsOptions,
  )

  const {
    register,
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
        fee: token.getTokenFeeFormatted() ?? 0,
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
          subTitle: usdRate!,
          isAssetPadding: true,
        })
      }

      onTransferPromise({
        assetImg: token?.getTokenLogo() ?? "",
        initialPromise: new Promise(async (resolve) => {
          const identity = await getIdentity([token!.getTokenAddress()])
          let res
          if (!token) return
          try {
            if (token?.getTokenAddress() === ICP_CANISTER_ID) {
              res = await transferICP({
                amount: stringICPtoE8s(String(values.amount)),
                to: getAccountIdentifier(values.to),
                identity: identity,
              })
            } else {
              const { owner, subaccount } = decodeIcrcAccount(values.to)
              res = await transferICRC1(identity, token.getTokenAddress(), {
                to: {
                  subaccount: subaccount ? [subaccount] : [],
                  owner,
                },
                amount: BigInt(
                  Number(values.amount) * 10 ** token?.getTokenDecimals()!,
                ),
                memo: [],
                fee: [token.getTokenFee()],
                from_subaccount: [],
                created_at_time: [],
              })
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
        subTitle: usdRate!,
        isAssetPadding: true,
        callback: () => {
          resetIntegrationCache(["getICRC1Canisters"], () => {
            refetchActiveTokens()
            refetchToken()
          })
        },
      })
    },
    [
      handleTrackTransfer,
      isVault,
      onTransferPromise,
      token,
      selectedVaultsAccountAddress,
      usdRate,
      refetchActiveTokens,
      refetchToken,
    ],
  )

  return (
    <TransferFTUi
      token={token}
      tokens={activeTokens}
      setChosenToken={setTokenAddress}
      validateAddress={
        token?.getTokenAddress() === ICP_CANISTER_ID
          ? validateICPAddress
          : validateICRC1Address
      }
      isLoading={isActiveTokensLoading || isTokenLoading}
      sendReceiveTrackingFn={sendReceiveTracking.supportedTokenModalOpened}
      isVault={isVault}
      selectedVaultsAccountAddress={selectedVaultsAccountAddress}
      submit={submit}
      setSelectedVaultsAccountAddress={setSelectedVaultsAccountAddress}
      register={register}
      errors={errors}
      handleSubmit={handleSubmit}
      setValue={setValue}
      resetField={resetField}
      loadingMessage={"Fetching supported tokens..."}
      accountsOptions={vaultsAccountsOptions}
      optionGroups={
        profile?.wallet === RootWallet.NFID ? [] : vaultsAccountsOptions ?? []
      }
      vaultsBalance={balance}
      setUsdAmount={setAmountInUSD}
    />
  )
}
