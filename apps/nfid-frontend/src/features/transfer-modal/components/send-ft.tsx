import { SignIdentity } from "@dfinity/agent"
import { AccountIdentifier } from "@dfinity/ledger-icp"
import { decodeIcrcAccount } from "@dfinity/ledger-icrc"
import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"
import debounce from "lodash/debounce"
import { PRINCIPAL_LENGTH } from "packages/constants"
import toaster from "packages/ui/src/atoms/toast"
import { TransferFTUi } from "packages/ui/src/organisms/send-receive/components/send-ft"
import { useCallback, useMemo, useState, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"

import { RootWallet, registerTransaction } from "@nfid/integration"
import {
  BTC_NATIVE_ID,
  E8S,
  ICP_CANISTER_ID,
} from "@nfid/integration/token/constants"
import {
  getAccountIdentifier,
  transfer as transferICP,
} from "@nfid/integration/token/icp"
import { transferICRC1 } from "@nfid/integration/token/icrc1"
import { State } from "@nfid/integration/token/icrc1/enum/enums"
import { mutateWithTimestamp, useSWR, useSWRWithTimestamp } from "@nfid/swr"

import { fetchTokens } from "frontend/features/fungible-token/utils"
import { useAllVaultsWallets } from "frontend/features/vaults/hooks/use-vaults-wallets-balances"
import { getVaultWalletByAddress } from "frontend/features/vaults/utils"
import { useBtcAddress } from "frontend/hooks"
import { bitcoinService } from "frontend/integration/bitcoin/bitcoin.service"
import { useProfile } from "frontend/integration/identity-manager/queries"
import { stringICPtoE8s } from "frontend/integration/wallet/utils"

import { FormValues, SendStatus } from "../types"
import {
  getIdentity,
  getTokensWithUpdatedBalance,
  getVaultsAccountsOptions,
  validateBTCAddress,
  validateICPAddress,
  validateICRC1Address,
} from "../utils"

const DEFAULT_TRANSFER_ERROR = "Something went wrong"

interface ITransferFT {
  preselectedTokenAddress: string | undefined
  isVault: boolean
  preselectedAccountAddress: string
  onClose: () => void
  hideZeroBalance: boolean
  setErrorMessage: (message: string) => void
  setSuccessMessage: (message: string) => void
}

export const TransferFT = ({
  isVault,
  preselectedTokenAddress = ICP_CANISTER_ID,
  preselectedAccountAddress = "",
  onClose,
  hideZeroBalance,
  setErrorMessage,
  setSuccessMessage,
}: ITransferFT) => {
  const [tokenAddress, setTokenAddress] = useState(preselectedTokenAddress)
  const [status, setStatus] = useState(SendStatus.PENDING)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [identity, setIdentity] = useState<SignIdentity>()
  const [isIdentityLoading, setIsIdentityLoading] = useState(false)
  const [selectedVaultsAccountAddress, setSelectedVaultsAccountAddress] =
    useState(preselectedAccountAddress)
  const [error, setError] = useState<string | undefined>()
  const { profile } = useProfile()
  const { balances } = useAllVaultsWallets()
  const { isBtcAddressLoading } = useBtcAddress()

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

  const isIdentityReady = !!identity && !isIdentityLoading
  const parsedAmount = Number(amount)
  const isAmountValid = !isNaN(parsedAmount) && parsedAmount > 0
  const [debouncedAmount, setDebouncedAmount] = useState(parsedAmount)

  const debouncedUpdate = useMemo(
    () =>
      debounce((val: number) => {
        setDebouncedAmount(val)
      }, 500),
    [setDebouncedAmount],
  )

  useEffect(() => {
    if (isAmountValid) {
      debouncedUpdate(parsedAmount)
    }
  }, [parsedAmount, isAmountValid, debouncedUpdate])

  const { data: vaultsAccountsOptions = [] } = useSWR(
    "vaultsAccountsOptions",
    getVaultsAccountsOptions,
  )

  useEffect(() => {
    if (!preselectedTokenAddress) {
      setTokenAddress(ICP_CANISTER_ID)
    } else {
      setTokenAddress(preselectedTokenAddress)
    }
  }, [preselectedTokenAddress])

  const { data: tokens = [], isLoading: isTokensLoading } = useSWRWithTimestamp(
    "tokens",
    fetchTokens,
    { revalidateOnFocus: false, revalidateOnMount: false },
  )

  const activeTokens = useMemo(() => {
    const activeTokens = tokens.filter(
      (token) => token.getTokenState() === State.Active,
    )
    if (!hideZeroBalance) return activeTokens
    const tokensWithBalance = activeTokens.filter(
      (token) =>
        token.getTokenAddress() === ICP_CANISTER_ID ||
        token.getTokenBalance() !== BigInt(0),
    )
    return tokensWithBalance
  }, [tokens, hideZeroBalance])

  const token = useMemo(() => {
    return tokens.find((token) => token.getTokenAddress() === tokenAddress)
  }, [tokenAddress, tokens])

  const balance = useMemo(() => {
    return balances?.find(
      (balance) => balance.address === selectedVaultsAccountAddress,
    )
  }, [selectedVaultsAccountAddress, balances])

  useEffect(() => {
    if (!token) return

    let isMounted = true
    setIdentity(undefined)
    setIsIdentityLoading(true)

    const targets =
      token.getTokenAddress() !== BTC_NATIVE_ID
        ? [token.getTokenAddress()]
        : [PATRON_CANISTER_ID, CHAIN_FUSION_SIGNER_CANISTER_ID]

    const getSignIdentity = async () => {
      try {
        const identity = await getIdentity(targets)
        if (isMounted) {
          setIdentity(identity)
          setIsIdentityLoading(false)
        }
      } catch (e) {
        if (isMounted) {
          setIsIdentityLoading(false)
          setIdentity(undefined)
        }
        console.error("Failed to get identity", e)
      }
    }

    getSignIdentity()

    return () => {
      isMounted = false
    }
  }, [token])

  useEffect(() => {
    if (isAmountValid) {
      debouncedUpdate(parsedAmount)
    }

    return () => {
      debouncedUpdate.cancel()
    }
  }, [parsedAmount, isAmountValid, debouncedUpdate])

  const shouldFetchBtcFee =
    token?.getTokenAddress() === BTC_NATIVE_ID &&
    isAmountValid &&
    !formMethods.formState.errors.amount &&
    isIdentityReady

  const { data: btcFee, isValidating } = useSWR(
    shouldFetchBtcFee ? ["btcFee", debouncedAmount.toString()] : null,
    () => token!.getBTCFee(identity!, debouncedAmount.toString()),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

  const submit = useCallback(async () => {
    if (!token) return toaster.error("No selected token")

    if (token.getTokenAddress() === BTC_NATIVE_ID) {
      if (!identity || !btcFee) return

      setIsSuccessOpen(true)
      bitcoinService
        .send(identity, to, amount, btcFee)
        .then(() => {
          setSuccessMessage(
            `Transaction ${amount} ${token.getTokenSymbol()} successful`,
          )
          setStatus(SendStatus.COMPLETED)
          getTokensWithUpdatedBalance([token.getTokenAddress()], tokens).then(
            (updatedTokens) => {
              mutateWithTimestamp("tokens", updatedTokens, false)
            },
          )
        })
        .catch((e) => {
          console.error(
            `Transfer error: ${
              (e as Error).message ? (e as Error).message : e
            }`,
          )
          setErrorMessage(DEFAULT_TRANSFER_ERROR)
          setError(DEFAULT_TRANSFER_ERROR)
          setStatus(SendStatus.FAILED)
        })

      return
    }

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
          setSuccessMessage(
            `Transaction ${amount} ${token.getTokenSymbol()} successful`,
          )
          setStatus(SendStatus.COMPLETED)
        })
        .catch((e) => {
          console.error(
            `Transfer error: ${
              (e as Error).message ? (e as Error).message : e
            }`,
          )
          setErrorMessage(DEFAULT_TRANSFER_ERROR)
          setError(DEFAULT_TRANSFER_ERROR)
          setStatus(SendStatus.FAILED)
        })

      return
    }

    if (!identity) return

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
          console.error(`Transfer error: ${JSON.stringify(res.Err)}`)
          let error = DEFAULT_TRANSFER_ERROR

          if (res.Err.hasOwnProperty("GenericError")) {
            const genericError = (
              res.Err as {
                GenericError: { message: string; error_code: bigint }
              }
            ).GenericError

            error = genericError.message
          }

          setErrorMessage(error)
          setError(error)
          setStatus(SendStatus.FAILED)
          return
        }
        setSuccessMessage(
          `Transaction ${amount} ${token.getTokenSymbol()} successful`,
        )
        setStatus(SendStatus.COMPLETED)
        getTokensWithUpdatedBalance([token.getTokenAddress()], tokens).then(
          (updatedTokens) => {
            mutateWithTimestamp("tokens", updatedTokens, false)
          },
        )
      })
      .catch((e) => {
        console.error(
          `Transfer error: ${(e as Error).message ? (e as Error).message : e}`,
        )
        setErrorMessage(DEFAULT_TRANSFER_ERROR)
        setError(DEFAULT_TRANSFER_ERROR)
        setStatus(SendStatus.FAILED)
      })
  }, [
    isVault,
    token,
    selectedVaultsAccountAddress,
    amount,
    to,
    tokens,
    setErrorMessage,
    setSuccessMessage,
    btcFee,
    identity,
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
            : token?.getTokenAddress() === BTC_NATIVE_ID
            ? validateBTCAddress
            : validateICRC1Address
        }
        isLoading={isTokensLoading || isBtcAddressLoading}
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
        error={error}
        btcFee={btcFee?.fee_satoshis || undefined}
        isFeeLoading={isValidating || isIdentityLoading || !identity}
      />
    </FormProvider>
  )
}
