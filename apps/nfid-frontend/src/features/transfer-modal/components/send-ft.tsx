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

import { FormValues, SendStatus } from "../types"
import {
  getAccountIdentifier,
  getIdentity,
  getVaultsAccountsOptions,
  updateTokenBalance,
  validateICPAddress,
  validateICRC1Address,
} from "../utils"

interface ITransferFT {
  preselectedTokenAddress: string | undefined
  isVault: boolean
  preselectedAccountAddress: string
  onClose: () => void
}

export const TransferFT = ({
  isVault,
  preselectedTokenAddress = ICP_CANISTER_ID,
  preselectedAccountAddress = "",
  onClose,
}: ITransferFT) => {
  const [tokenAddress, setTokenAddress] = useState(preselectedTokenAddress)
  const [status, setStatus] = useState(SendStatus.PENDING)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
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
    {
      revalidateOnMount: false,
      revalidateOnFocus: false,
    },
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

  const balance = useMemo(() => {
    return balances?.find(
      (balance) => balance.address === selectedVaultsAccountAddress,
    )
  }, [selectedVaultsAccountAddress, balances])

  const submit = useCallback(async () => {
    if (!token) return toaster.error("No selected token")

    setIsSuccessOpen(true)

    if (isVault) {
      const wallet = await getVaultWalletByAddress(selectedVaultsAccountAddress)

      const address =
        to.length === PRINCIPAL_LENGTH
          ? AccountIdentifier.fromPrincipal({
              principal: Principal.fromText(to),
            }).toHex()
          : to

      registerTransaction({
        address,
        amount: BigInt(Math.round(Number(amount) * E8S)),
        from_sub_account: wallet?.uid ?? "",
      })
        .then(() => {
          sendReceiveTracking.sendToken({
            destinationType: "address",
            tokenName: token.getTokenName(),
            tokenType: "fungible",
            amount: amount,
            fee: token.getTokenFeeFormatted() ?? 0,
          })
          setStatus(SendStatus.COMPLETED)
        })
        .catch((e) => {
          console.error(
            `Transfer error: ${
              (e as Error).message ? (e as Error).message : e
            }`,
          )
          setStatus(SendStatus.FAILED)
        })

      return
    }

    const identity = await getIdentity([token.getTokenAddress()])
    let transferResult

    if (token.getTokenAddress() === ICP_CANISTER_ID) {
      transferResult = transferICP({
        amount: stringICPtoE8s(String(amount)),
        to: getAccountIdentifier(to),
        identity: identity,
      })
    } else {
      const { owner, subaccount } = decodeIcrcAccount(to)
      transferResult = transferICRC1(identity, token.getTokenAddress(), {
        to: {
          subaccount: subaccount ? [subaccount] : [],
          owner,
        },
        amount: BigInt(Number(amount) * 10 ** token.getTokenDecimals()!),
        memo: [],
        fee: [token.getTokenFee()],
        from_subaccount: [],
        created_at_time: [],
      })
    }

    transferResult
      .then(() => {
        sendReceiveTracking.sendToken({
          destinationType: "address",
          tokenName: token.getTokenName(),
          tokenType: "fungible",
          amount: amount,
          fee: token.getTokenFeeFormatted() ?? 0,
        })
        setStatus(SendStatus.COMPLETED)
        updateTokenBalance([token.getTokenAddress()], activeTokens)
      })
      .catch((e) => {
        console.error(
          `Transfer error: ${(e as Error).message ? (e as Error).message : e}`,
        )
        setStatus(SendStatus.FAILED)
      })
  }, [isVault, token, selectedVaultsAccountAddress, amount, to, activeTokens])

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
        status={status}
        isSuccessOpen={isSuccessOpen}
        onClose={onClose}
      />
    </FormProvider>
  )
}
