import { AccountIdentifier } from "@dfinity/ledger-icp"
import { decodeIcrcAccount } from "@dfinity/ledger-icrc"
import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"
import debounce from "lodash/debounce"
import { PRINCIPAL_LENGTH } from "packages/constants"
import toaster from "packages/ui/src/atoms/toast"
import { TransferFTUi } from "packages/ui/src/organisms/send-receive/components/send-ft"
import { useCallback, useMemo, useState, useEffect, useRef } from "react"
import { useForm, FormProvider } from "react-hook-form"

import { RootWallet, registerTransaction } from "@nfid/integration"
import {
  BTC_NATIVE_ID,
  ETH_NATIVE_ID,
  E8S,
  ICP_CANISTER_ID,
} from "@nfid/integration/token/constants"
import {
  getAccountIdentifier,
  transfer as transferICP,
} from "@nfid/integration/token/icp"
import { transferICRC1 } from "@nfid/integration/token/icrc1"
import { mutateWithTimestamp, useSWR, useSWRWithTimestamp } from "@nfid/swr"

import { fetchTokens } from "frontend/features/fungible-token/utils"
import { useAllVaultsWallets } from "frontend/features/vaults/hooks/use-vaults-wallets-balances"
import { getVaultWalletByAddress } from "frontend/features/vaults/utils"
import { useBtcAddress, useEthAddress } from "frontend/hooks"
import { useIdentity } from "frontend/hooks/identity"
import {
  bitcoinService,
  BitcointNetworkFeeAndUtxos,
} from "frontend/integration/bitcoin/bitcoin.service"
import { SendEthFee } from "frontend/integration/ethereum/evm.service"
import { ethereumService } from "frontend/integration/ethereum/eth/ethereum.service"
import { useProfile } from "frontend/integration/identity-manager/queries"
import { stringICPtoE8s } from "frontend/integration/wallet/utils"

import { FormValues, SendStatus } from "../types"
import {
  getTokensWithUpdatedBalance,
  getVaultsAccountsOptions,
  validateICRC1Address,
  addressValidators,
  updateCachedInitedTokens,
} from "../utils"
import { useTokensInit } from "packages/ui/src/organisms/send-receive/hooks/token-init"

const DEFAULT_TRANSFER_ERROR = "Something went wrong"

interface ITransferFT {
  preselectedTokenAddress: string | undefined
  isVault: boolean
  preselectedAccountAddress: string
  onClose: () => void
  hideZeroBalance: boolean
  setErrorMessage: (message: string) => void
  setSuccessMessage: (message: string) => void
  onError: (value: boolean) => void
}

export const TransferFT = ({
  isVault,
  preselectedTokenAddress = ICP_CANISTER_ID,
  preselectedAccountAddress = "",
  onClose,
  hideZeroBalance,
  setErrorMessage,
  setSuccessMessage,
  onError,
}: ITransferFT) => {
  const [tokenAddress, setTokenAddress] = useState(preselectedTokenAddress)
  const [status, setStatus] = useState(SendStatus.PENDING)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const { identity, isLoading: isIdentityLoading } = useIdentity()
  const [selectedVaultsAccountAddress, setSelectedVaultsAccountAddress] =
    useState(preselectedAccountAddress)
  const [error, setError] = useState<string | undefined>()
  const [btcError, setBtcError] = useState<string | undefined>()
  const [ethError, setEthError] = useState<string | undefined>()
  const { profile } = useProfile()
  const { balances } = useAllVaultsWallets()
  const { isBtcAddressLoading } = useBtcAddress()
  const { isEthAddressLoading, ethAddress } = useEthAddress()
  const [btcFee, setBtcFee] = useState<BitcointNetworkFeeAndUtxos | undefined>(
    undefined,
  )
  const [ethFee, setEthFee] = useState<SendEthFee | undefined>(undefined)
  const [isValidating, setIsValidating] = useState(false)
  const skipFeeCalculation = useRef(false)

  const triggerSkipCaclulation = useCallback(() => {
    skipFeeCalculation.current = true
  }, [])

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
      }, 1000),
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

  const { initedTokens, mutate: mutateInitedTokens } = useTokensInit(
    tokens,
    isBtcAddressLoading,
    isEthAddressLoading,
  )

  const filteredTokens = useMemo(() => {
    if (!initedTokens) return
    if (!hideZeroBalance) return initedTokens
    const tokensWithBalance = initedTokens.filter(
      (token) =>
        token.getTokenAddress() === ICP_CANISTER_ID ||
        token.getTokenBalance() !== BigInt(0),
    )
    return tokensWithBalance
  }, [initedTokens, hideZeroBalance])

  const token = useMemo(() => {
    return filteredTokens?.find(
      (token) => token.getTokenAddress() === tokenAddress,
    )
  }, [tokenAddress, filteredTokens])

  const balance = useMemo(() => {
    return balances?.find(
      (balance) => balance.address === selectedVaultsAccountAddress,
    )
  }, [selectedVaultsAccountAddress, balances])

  useEffect(() => {
    onError(Boolean(btcError))
  }, [btcError, onError])

  useEffect(() => {
    if (isAmountValid) {
      debouncedUpdate(parsedAmount)
    }

    return () => {
      debouncedUpdate.cancel()
    }
  }, [parsedAmount, isAmountValid, debouncedUpdate])

  useEffect(() => {
    let isCancelled = false

    if (
      !isAmountValid ||
      !!formMethods.formState.errors.amount ||
      !isIdentityReady
    )
      return

    if (skipFeeCalculation.current) {
      skipFeeCalculation.current = false
      return
    }

    const fetchBtcFee = async () => {
      if (token?.getTokenAddress() === BTC_NATIVE_ID) {
        setBtcFee(undefined)
        setIsValidating(true)
        try {
          const fee = await token.getBTCFee(identity!, debouncedAmount)
          if (!isCancelled) setBtcFee(fee)
        } catch (e) {
          console.error(`BTC error: ${e}`)
          setBtcError((e as Error).message)
          if (!isCancelled) setBtcFee(undefined)
        } finally {
          if (!isCancelled) setIsValidating(false)
        }
      } else {
        setBtcFee(undefined)
      }
    }

    const fetchEthFee = async () => {
      if (token?.getTokenAddress() === ETH_NATIVE_ID) {
        setEthFee(undefined)
        setIsValidating(true)
        try {
          const fee = await token.getETHFee(to, ethAddress, debouncedAmount)
          if (!isCancelled) setEthFee(fee)
        } catch (e) {
          console.error(`ETH error: ${e}`)
          setEthError((e as Error).message)
          if (!isCancelled) setEthFee(undefined)
        } finally {
          if (!isCancelled) setIsValidating(false)
        }
      } else {
        setBtcFee(undefined)
      }
    }

    fetchBtcFee()
    fetchEthFee()

    return () => {
      isCancelled = true
    }
  }, [
    token,
    identity,
    debouncedAmount,
    isAmountValid,
    formMethods.formState.errors.amount,
    isIdentityReady,
    to,
    ethAddress,
  ])

  useEffect(() => {
    setBtcError(undefined)
    setEthError(undefined)
    setDebouncedAmount(0)
  }, [token])

  const submit = useCallback(async () => {
    if (!token) return toaster.error("No selected token")

    if (token.getTokenAddress() === ETH_NATIVE_ID) {
      if (!identity || !ethFee) return

      setIsSuccessOpen(true)
      ethereumService
        .sendEthTransaction(identity, to, amount, ethFee)
        .then(() => {
          setSuccessMessage(
            `Transaction ${amount} ${token.getTokenSymbol()} successful`,
          )
          setStatus(SendStatus.COMPLETED)
          if (!initedTokens) return

          getTokensWithUpdatedBalance(
            [token.getTokenAddress()],
            initedTokens,
          ).then((updatedTokens) => {
            mutateWithTimestamp("tokens", updatedTokens, false)
            updateCachedInitedTokens(updatedTokens, mutateInitedTokens)
          })
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
          if (!initedTokens) return

          getTokensWithUpdatedBalance(
            [token.getTokenAddress()],
            initedTokens,
          ).then((updatedTokens) => {
            mutateWithTimestamp("tokens", updatedTokens, false)
            updateCachedInitedTokens(updatedTokens, mutateInitedTokens)
          })
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
        if (!initedTokens) return

        getTokensWithUpdatedBalance(
          [token.getTokenAddress()],
          initedTokens,
        ).then((updatedTokens) => {
          mutateWithTimestamp("tokens", updatedTokens, false)
          updateCachedInitedTokens(updatedTokens, mutateInitedTokens)
        })
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
    initedTokens,
    setErrorMessage,
    setSuccessMessage,
    btcFee,
    ethFee,
    identity,
    mutateInitedTokens,
  ])

  return (
    <FormProvider {...formMethods}>
      <TransferFTUi
        token={token}
        tokens={filteredTokens || []}
        setChosenToken={setTokenAddress}
        validateAddress={
          addressValidators[token?.getTokenAddress() ?? ""] ||
          validateICRC1Address
        }
        isLoading={isTokensLoading}
        isBtcEthLoading={isBtcAddressLoading || isEthAddressLoading}
        isVault={isVault}
        selectedVaultsAccountAddress={selectedVaultsAccountAddress}
        submit={submit}
        setSelectedVaultsAccountAddress={setSelectedVaultsAccountAddress}
        loadingMessage={"Fetching supported tokens..."}
        accountsOptions={vaultsAccountsOptions}
        optionGroups={
          profile?.wallet === RootWallet.NFID
            ? []
            : (vaultsAccountsOptions ?? [])
        }
        vaultsBalance={balance?.balance["ICP"]}
        status={status}
        isSuccessOpen={isSuccessOpen}
        onClose={onClose}
        error={error}
        btcError={btcError}
        ethError={ethError}
        btcFee={btcFee?.fee_satoshis || undefined}
        ethFee={ethFee?.ethereumNetworkFee || undefined}
        isFeeLoading={isValidating || isIdentityLoading || !identity}
        setSkipFeeCalculation={triggerSkipCaclulation}
      />
    </FormProvider>
  )
}
