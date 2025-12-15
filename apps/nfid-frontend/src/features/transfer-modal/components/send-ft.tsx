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
import { E8S, ICP_CANISTER_ID } from "@nfid/integration/token/constants"
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
import { bitcoinService } from "frontend/integration/bitcoin/bitcoin.service"
import { useProfile } from "frontend/integration/identity-manager/queries"
import { stringICPtoE8s } from "frontend/integration/wallet/utils"

import { FormValues, SendStatus } from "../types"
import {
  getTokensWithUpdatedBalance,
  getVaultsAccountsOptions,
  getValidatorByTokenAddress,
  updateCachedInitedTokens,
} from "../utils"
import { useTokensInit } from "packages/ui/src/organisms/send-receive/hooks/token-init"
import {
  FeeResponse,
  FeeResponseBTC,
  FeeResponseETH,
} from "frontend/integration/ft/utils"
import {
  Category,
  ChainId,
  isEvmNativeToken,
} from "@nfid/integration/token/icrc1/enum/enums"
import { FTEvmAbstractImpl } from "frontend/integration/ft/impl/ft-evm-abstract-impl"
import { FTERC20AbstractImpl } from "frontend/integration/ft/impl/ft-erc20-abstract-impl"
import { TransactionResponse } from "ethers"

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
  const [feeError, setFeeError] = useState<string | undefined>()
  const { profile } = useProfile()
  const { balances } = useAllVaultsWallets()
  const { isBtcAddressLoading } = useBtcAddress()
  const { isEthAddressLoading, ethAddress } = useEthAddress()
  const [fee, setFee] = useState<FeeResponse | undefined>()
  const [isFeeLoading, setIsFeeLoading] = useState(false)
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
    onError(Boolean(feeError))
  }, [feeError, onError])

  useEffect(() => {
    if (isAmountValid) {
      debouncedUpdate(parsedAmount)
    }

    return () => {
      debouncedUpdate.cancel()
    }
  }, [parsedAmount, isAmountValid, debouncedUpdate])

  useEffect(() => {
    const fetchIcrc1Fee = async () => {
      setIsFeeLoading(true)

      const fee = await token?.getTokenFee()

      setFee(fee)
      setIsFeeLoading(false)
    }

    if (token?.getChainId() === ChainId.ICP) {
      fetchIcrc1Fee()
      return
    }

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

    const fetchNonIcrc1Fee = async () => {
      if (
        token?.getChainId() === ChainId.BTC ||
        (token && isEvmNativeToken(token.getChainId()))
      ) {
        setFee(undefined)
        setIsFeeLoading(true)
        try {
          let fee =
            token?.getChainId() === ChainId.BTC
              ? await token?.getTokenFee(debouncedAmount, identity)
              : await token?.getTokenFee(
                  debouncedAmount,
                  undefined,
                  to,
                  ethAddress,
                  token.getTokenDecimals(),
                )

          if (!isCancelled) setFee(fee)
        } catch (e) {
          console.error(`Fee error: ${e}`)
          setFeeError((e as Error).message)
          if (!isCancelled) setFee(undefined)
        } finally {
          if (!isCancelled) setIsFeeLoading(false)
        }
      }
    }

    fetchNonIcrc1Fee()

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
    setFeeError(undefined)
    setFee(undefined)
    setDebouncedAmount(0)
  }, [token])

  const submit = useCallback(async () => {
    if (!token) return toaster.error("No selected token")

    if (isEvmNativeToken(token.getChainId())) {
      if (!identity || !fee) return

      const ethFee = fee as FeeResponseETH
      const nativeProvider = (token as FTEvmAbstractImpl).getProvider()
      const erc20Provider = (token as FTERC20AbstractImpl).getProvider()
      let sendEvmPromise: Promise<TransactionResponse>

      setIsSuccessOpen(true)

      if (token.getTokenCategory() === Category.ERC20) {
        sendEvmPromise = erc20Provider.sendErc20Transaction(
          identity,
          token.getTokenAddress(),
          to,
          amount,
          token.getTokenDecimals(),
          {
            gasUsed: ethFee.getGasUsed(),
            maxFeePerGas: ethFee.getMaxFeePerGas(),
            maxPriorityFeePerGas: ethFee.getMaxPriorityFeePerGas(),
            baseFeePerGas: ethFee.getBaseFeePerGas(),
          },
        )
      } else {
        sendEvmPromise = nativeProvider.sendEthTransaction(
          identity,
          to,
          amount,
          {
            gasUsed: ethFee.getGasUsed(),
            maxFeePerGas: ethFee.getMaxFeePerGas(),
            maxPriorityFeePerGas: ethFee.getMaxPriorityFeePerGas(),
            baseFeePerGas: ethFee.getBaseFeePerGas(),
          },
          token.getChainId(),
        )
      }

      sendEvmPromise
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

    if (token.getChainId() === ChainId.BTC) {
      if (!identity || !fee) return

      const btcFee = fee as FeeResponseBTC

      setIsSuccessOpen(true)
      bitcoinService
        .send(identity, to, amount, {
          fee_satoshis: btcFee.getFee(),
          utxos: btcFee.getUtxos(),
        })
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

    if (token.getChainId() === ChainId.ICP) {
      if (isVault) {
        const wallet = await getVaultWalletByAddress(
          selectedVaultsAccountAddress,
        )

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
          fee: [fee?.getFee()!],
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
    }
  }, [
    isVault,
    token,
    selectedVaultsAccountAddress,
    amount,
    to,
    initedTokens,
    setErrorMessage,
    setSuccessMessage,
    fee,
    identity,
    mutateInitedTokens,
  ])

  return (
    <FormProvider {...formMethods}>
      <TransferFTUi
        token={token}
        tokens={filteredTokens || []}
        setChosenToken={setTokenAddress}
        validateAddress={getValidatorByTokenAddress(
          token?.getTokenAddress(),
          token?.getTokenCategory(),
        )}
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
        feeError={feeError}
        fee={fee?.getFee()}
        isFeeLoading={isFeeLoading || isIdentityLoading || !identity}
        setSkipFeeCalculation={triggerSkipCaclulation}
      />
    </FormProvider>
  )
}
