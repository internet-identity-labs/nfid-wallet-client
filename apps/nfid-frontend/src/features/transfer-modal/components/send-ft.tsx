import { AccountIdentifier } from "@dfinity/ledger-icp"
import { decodeIcrcAccount } from "@dfinity/ledger-icrc"
import { Principal } from "@dfinity/principal"
import { PRINCIPAL_LENGTH } from "packages/constants"
import toaster from "packages/ui/src/atoms/toast"
import { TransferFTUi } from "packages/ui/src/organisms/send-receive/components/send-ft"
import { fetchActiveTokens } from "packages/ui/src/organisms/tokens/utils"
import { useCallback, useMemo, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
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

import { FormValues, ITransferResponse } from "../types"
import {
  getAccountIdentifier,
  getIdentity,
  getVaultsAccountsOptions,
  updateTokenBalance,
  validateICPAddress,
  validateICRC1Address,
} from "../utils"
import { ITransferSuccess } from "./send-success"

interface ITransferFT {
  preselectedTokenAddress: string | undefined
  isVault: boolean
  preselectedAccountAddress: string
  onTransfer: (data: ITransferSuccess) => void
}

export const TransferFT = ({
  isVault,
  preselectedTokenAddress = ICP_CANISTER_ID,
  preselectedAccountAddress = "",
  onTransfer,
}: ITransferFT) => {
  const [tokenAddress, setTokenAddress] = useState(preselectedTokenAddress)
  const [selectedVaultsAccountAddress, setSelectedVaultsAccountAddress] =
    useState(preselectedAccountAddress)
  const { profile } = useProfile()
  const { balances } = useAllVaultsWallets()

  const { data: vaultsAccountsOptions = [] } = useSWR(
    "vaultsAccountsOptions",
    getVaultsAccountsOptions,
  )

  const { data: activeTokens = [], isLoading: isActiveTokensLoading } = useSWR(
    "activeTokens",
    fetchActiveTokens,
  )

  const token = useMemo(() => {
    return activeTokens.find(
      (token) => token.getTokenAddress() === tokenAddress,
    )
  }, [tokenAddress, activeTokens])

  const formMethods = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      amount: "",
      to: "",
    },
  })

  const { watch } = formMethods
  const amount = watch("amount")
  const to = watch("to")

  const { data: usdRate } = useSWR(
    token ? ["tokenRate", token.getTokenAddress(), amount] : null,
    ([_, __, amount]) => token?.getTokenRateFormatted(amount.toString()),
  )

  const balance = useMemo(() => {
    return balances?.find(
      (balance) => balance.address === selectedVaultsAccountAddress,
    )
  }, [selectedVaultsAccountAddress, balances])

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

  const submit = useCallback(async () => {
    if (!token) return toaster.error("No selected token")

    if (isVault) {
      return onTransfer({
        assetImg: token.getTokenLogo() ?? "",
        initialPromise: new Promise(async (resolve) => {
          const wallet = await getVaultWalletByAddress(
            selectedVaultsAccountAddress,
          )

          const address =
            to.length === PRINCIPAL_LENGTH
              ? AccountIdentifier.fromPrincipal({
                  principal: Principal.fromText(to),
                }).toHex()
              : to

          await registerTransaction({
            address,
            amount: BigInt(Math.round(Number(amount) * E8S)),
            from_sub_account: wallet?.uid ?? "",
          })

          resolve({} as ITransferResponse)
        }),
        title: `${amount} ${token.getTokenSymbol()}`,
        subTitle: usdRate!,
        isAssetPadding: true,
      })
    }

    onTransfer({
      assetImg: token?.getTokenLogo() ?? "",
      initialPromise: new Promise(async (resolve) => {
        const identity = await getIdentity([token!.getTokenAddress()])
        let res
        if (!token) return
        try {
          if (token?.getTokenAddress() === ICP_CANISTER_ID) {
            res = await transferICP({
              amount: stringICPtoE8s(String(amount)),
              to: getAccountIdentifier(to),
              identity: identity,
            })
          } else {
            const { owner, subaccount } = decodeIcrcAccount(to)
            res = await transferICRC1(identity, token.getTokenAddress(), {
              to: {
                subaccount: subaccount ? [subaccount] : [],
                owner,
              },
              amount: BigInt(Number(amount) * 10 ** token?.getTokenDecimals()!),
              memo: [],
              fee: [token.getTokenFee()],
              from_subaccount: [],
              created_at_time: [],
            })
          }

          handleTrackTransfer(amount)
          resolve({ hash: String(res) })
        } catch (e) {
          throw new Error(
            `Transfer error: ${
              (e as Error).message ? (e as Error).message : e
            }`,
          )
        }
      }),
      title: `${Number(amount)
        .toFixed(token?.getTokenDecimals())
        .replace(/\.?0+$/, "")} ${token?.getTokenSymbol()}`,
      subTitle: usdRate!,
      isAssetPadding: true,
      callback: () => {
        updateTokenBalance([token.getTokenAddress()], activeTokens)
      },
    })
  }, [
    activeTokens,
    handleTrackTransfer,
    isVault,
    onTransfer,
    token,
    selectedVaultsAccountAddress,
    usdRate,
    amount,
    to,
  ])

  return (
    <FormProvider {...formMethods}>
      <TransferFTUi
        token={token}
        tokens={activeTokens}
        setChosenToken={setTokenAddress}
        validateAddress={
          token?.getTokenAddress() === ICP_CANISTER_ID
            ? validateICPAddress
            : validateICRC1Address
        }
        isLoading={isActiveTokensLoading}
        isVault={isVault}
        selectedVaultsAccountAddress={selectedVaultsAccountAddress}
        submit={submit}
        setSelectedVaultsAccountAddress={setSelectedVaultsAccountAddress}
        loadingMessage={"Fetching supported tokens..."}
        accountsOptions={vaultsAccountsOptions}
        optionGroups={
          profile?.wallet === RootWallet.NFID ? [] : vaultsAccountsOptions ?? []
        }
        vaultsBalance={balance?.balance["ICP"]}
        usdRate={usdRate}
      />
    </FormProvider>
  )
}
