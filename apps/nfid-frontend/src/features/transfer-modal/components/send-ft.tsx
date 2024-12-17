import { AccountIdentifier } from "@dfinity/ledger-icp"
import { decodeIcrcAccount } from "@dfinity/ledger-icrc"
import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"
import { PRINCIPAL_LENGTH } from "packages/constants"
import toaster from "packages/ui/src/atoms/toast"
import { TransferFTUi } from "packages/ui/src/organisms/send-receive/components/send-ft"
import { fetchTokens } from "packages/ui/src/organisms/tokens/utils"
import { useCallback, useMemo, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { useSWR } from "@nfid/swr"

import { RootWallet, registerTransaction } from "@nfid/integration"
import { E8S, ICP_CANISTER_ID } from "@nfid/integration/token/constants"
import { transfer as transferICP } from "@nfid/integration/token/icp"
import { transferICRC1 } from "@nfid/integration/token/icrc1"
import { State } from "@nfid/integration/token/icrc1/enum/enums"
import { mutate } from "@nfid/swr"

import { useAllVaultsWallets } from "frontend/features/vaults/hooks/use-vaults-wallets-balances"
import { getVaultWalletByAddress } from "frontend/features/vaults/utils"
import { useProfile } from "frontend/integration/identity-manager/queries"
import { stringICPtoE8s } from "frontend/integration/wallet/utils"

import { FormValues, SendStatus } from "../types"
import {
  getAccountIdentifier,
  getIdentity,
  getTokensWithUpdatedBalance,
  getVaultsAccountsOptions,
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

  const { data: tokens = [], isLoading: isTokensLoading } = useSWR(
    "tokens",
    fetchTokens,
    { revalidateOnFocus: false, revalidateOnMount: false },
  )

  const activeTokens = useMemo(() => {
    return tokens.filter((token) => token.getTokenState() === State.Active)
  }, [tokens])

  const token = useMemo(() => {
    return tokens.find((token) => token.getTokenAddress() === tokenAddress)
  }, [tokenAddress, tokens])

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
          toaster.success(
            `Transaction ${amount} ${token.getTokenSymbol()} successful`,
            {
              toastId: "successTransfer",
            },
          )
          setStatus(SendStatus.COMPLETED)
        })
        .catch((e) => {
          console.error(
            `Transfer error: ${
              (e as Error).message ? (e as Error).message : e
            }`,
          )
          toaster.error("Something went wrong")
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
        amount: BigInt(
          BigNumber(amount)
            .multipliedBy(10 ** token.getTokenDecimals()!)
            .toFixed(),
        ),
        memo: [],
        fee: [token.getTokenFee()],
        from_subaccount: [],
        created_at_time: [],
      })
    }

    transferResult
      .then((res) => {
        if (typeof res === "object" && "Err" in res) {
          toaster.error("Something went wrong")
          console.error(`Transfer error: ${JSON.stringify(res.Err)}`)
          setStatus(SendStatus.FAILED)
          return
        }
        setStatus(SendStatus.COMPLETED)
        getTokensWithUpdatedBalance([token.getTokenAddress()], tokens).then(
          (updatedTokens) => {
            mutate("tokens", updatedTokens, false)
          },
        )
        toaster.success(
          `Transaction ${amount} ${token.getTokenSymbol()} successful`,
          {
            toastId: "successTransfer",
          },
        )
      })
      .catch((e) => {
        console.error(
          `Transfer error: ${(e as Error).message ? (e as Error).message : e}`,
        )
        toaster.error("Something went wrong")
        setStatus(SendStatus.FAILED)
      })
  }, [isVault, token, selectedVaultsAccountAddress, amount, to, tokens])

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
        isLoading={isTokensLoading}
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
