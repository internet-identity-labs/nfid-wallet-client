import clsx from "clsx"
import { useCallback, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import useSWR from "swr"

import {
  Button,
  ChooseModal,
  IconCmpArrow,
  IconCmpArrowRight,
  Image,
  Label,
  SmoothBlurredLoader,
  sumRules,
} from "@nfid-frontend/ui"

import { Spinner } from "frontend/ui/atoms/loader/spinner"
import {
  getAllTokensOptions,
  getConnector,
} from "frontend/ui/connnector/transfer-modal/transfer-factory"
import { TransferModalType } from "frontend/ui/connnector/transfer-modal/types"
import { Blockchain } from "frontend/ui/connnector/types"

import { validateTransferAmountField } from "../utils/validations"

interface ITransferFT {
  preselectedTokenCurrency: string
  preselectedAccountAddress: string
  onSuccess: (message: string) => void
}

export const TransferFT = ({
  preselectedTokenCurrency,
  preselectedAccountAddress = "",
  onSuccess,
}: ITransferFT) => {
  const [isTransferInProgress, setIsTransferInProgress] = useState(false)
  const [selectedTokenCurrency, setSelectedTokenCurrency] = useState(
    preselectedTokenCurrency,
  )
  const [selectedAccountAddress, setSelectedAccountAddress] = useState(
    preselectedAccountAddress,
  )

  const { data: selectedConnector, isLoading: isConnectorLoading } = useSWR(
    [selectedTokenCurrency, "selectedConnector"],
    ([selectedTokenCurrency]) =>
      getConnector({
        type: TransferModalType.FT,
        currency: selectedTokenCurrency,
      }),
  )

  const { data: tokenMetadata, isLoading: isMetadataLoading } = useSWR<any>(
    selectedConnector ? [selectedConnector, "tokenMetadata"] : null,
    async ([selectedConnector]) => {
      // if it's dip20 token, we need to fetch token metadata
      if (selectedConnector.getTokenMetadata)
        return await selectedConnector.getTokenMetadata(selectedTokenCurrency)
      else return selectedConnector.getTokenConfig()
    },
  )

  const { data: accountsOptions, isLoading: isAccountsLoading } = useSWR(
    selectedConnector ? [selectedConnector, "accountsOptions"] : null,
    ([connector]) => connector.getAccountsOptions(selectedTokenCurrency),
    {
      onSuccess: (data) => {
        setSelectedAccountAddress(data[0].options[0]?.value)
      },
    },
  )

  const { data: balance, mutate: refetchBalance } = useSWR(
    selectedConnector ? [selectedConnector, "balance"] : null,
    ([connector]) =>
      connector.getBalance(selectedAccountAddress, selectedTokenCurrency),
    { refreshInterval: 10000 },
  )

  const { data: tokenOptions, isLoading: isTokensLoading } = useSWR(
    "getAllTokensOptions",
    getAllTokensOptions,
  )

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    setError,
    resetField,
    getValues,
  } = useForm({
    mode: "all",
    defaultValues: {
      amount: undefined as any as number,
      to: "",
    },
  })

  const {
    data: transferFee,
    mutate: calculateFee,
    isValidating: isFeeLoading,
  } = useSWR(
    selectedConnector ? [selectedConnector, getValues, "transferFee"] : null,
    ([selectedConnector, getValues]) =>
      selectedConnector?.getFee({
        amount: getValues("amount"),
        to: getValues("to"),
        currency: selectedTokenCurrency,
        contract: tokenMetadata.contractAddress,
      }),
    {
      refreshInterval: 5000,
    },
  )

  const submit = useCallback(
    async (values: any) => {
      if (!tokenMetadata) return toast.error("Token metadata has not loaded")
      if (values.to === selectedAccountAddress)
        return setError("to", {
          type: "value",
          message: "You can't transfer to the same wallet",
        })

      try {
        setIsTransferInProgress(true)
        const identity = await selectedConnector?.getIdentity(
          selectedAccountAddress,
        )
        const response = await selectedConnector?.transfer({
          to: values.to,
          amount: values.amount,
          currency: selectedTokenCurrency,
          identity: identity,
          contract: tokenMetadata.contractAddress,
        })

        if (response?.status === "ok")
          onSuccess(
            response?.successMessage ??
              `You've sent ${values.amount} ${selectedTokenCurrency}`,
          )
        else throw new Error(response?.errorMessage)
      } catch (e: any) {
        toast.error(
          e?.message ?? "Unexpected error: The transaction has been cancelled",
        )
      } finally {
        setIsTransferInProgress(false)
        refetchBalance()
      }
    },
    [
      onSuccess,
      refetchBalance,
      selectedAccountAddress,
      selectedConnector,
      selectedTokenCurrency,
      setError,
      tokenMetadata,
    ],
  )

  const loadingMessage = useMemo(() => {
    if (isTransferInProgress) return "Sending..."
    if (isTokensLoading) return "Fetching supported tokens..."
    if (isConnectorLoading || isMetadataLoading)
      return "Loading token config..."
    if (isAccountsLoading) return "Loading accounts..."
  }, [
    isAccountsLoading,
    isConnectorLoading,
    isMetadataLoading,
    isTokensLoading,
    isTransferInProgress,
  ])

  return (
    <SmoothBlurredLoader
      className="text-xs"
      overlayClassnames="rounded-xl"
      isLoading={
        isTransferInProgress ||
        isConnectorLoading ||
        isAccountsLoading ||
        isMetadataLoading ||
        isTokensLoading
      }
      loadingMessage={loadingMessage}
    >
      <p className="mb-1">Amount to send</p>
      <div className="space-y-3">
        <div
          className={clsx(
            "border rounded-md flex items-center justify-between pl-4 pr-5 h-14",
            errors.amount ? "ring border-red-600 ring-red-100" : "border-black",
          )}
        >
          <input
            className={clsx(
              "min-w-0 text-xl placeholder:text-black font-semibold",
              "outline-none border-none h-[54px] focus:ring-0",
              "p-0",
            )}
            placeholder="0.00"
            type="number"
            id="amount"
            min={0.0}
            {...register("amount", {
              required: sumRules.errorMessages.required,
              validate: validateTransferAmountField(balance?.balance),
              valueAsNumber: true,
              onBlur: calculateFee,
            })}
          />
          <div
            className={clsx(
              "absolute mt-[72px] left-5",
              "text-xs py-1 text-red",
            )}
          >
            {errors.amount?.message}
          </div>
          <ChooseModal
            optionGroups={tokenOptions ?? []}
            title="Choose an asset"
            type="trigger"
            onSelect={setSelectedTokenCurrency}
            preselectedValue={selectedTokenCurrency}
            isSmooth
            trigger={
              <div
                id={`token_${selectedTokenCurrency}`}
                className="flex items-center cursor-pointer shrink-0"
              >
                <Image
                  className="w-[26px] mr-1.5"
                  src={tokenMetadata?.icon}
                  alt={selectedTokenCurrency}
                />

                <p className="text-lg font-semibold">{selectedTokenCurrency}</p>
                <IconCmpArrowRight className="ml-4" />
              </div>
            }
          />
        </div>
        <ChooseModal
          label="From"
          title={"Choose an account"}
          optionGroups={accountsOptions ?? []}
          preselectedValue={selectedAccountAddress}
          onSelect={setSelectedAccountAddress}
        />
        <ChooseModal
          type="input"
          label="To"
          title={"Choose an account"}
          optionGroups={accountsOptions ?? []}
          isFirstPreselected={false}
          placeholder={tokenMetadata?.addressPlaceholder}
          errorText={errors.to?.message}
          registerFunction={register("to", {
            required: "This field cannot be empty",
            validate: (value) => selectedConnector?.validateAddress(value),
            onBlur: calculateFee,
          })}
          onSelect={(value) => {
            resetField("to")
            setValue("to", value)
            calculateFee()
          }}
        />
        <div>
          <Label>Network fee</Label>
          <div
            className={clsx(
              "flex items-center justify-between mt-1",
              "px-2.5 text-gray-400 bg-gray-100 rounded-md h-14",
            )}
          >
            <div>
              <p className="text-sm">
                {tokenMetadata?.blockchain === Blockchain.IC
                  ? "Instant"
                  : "Estimated"}
              </p>
            </div>
            {isFeeLoading ? (
              <Spinner className="w-3 h-3 text-gray-400" />
            ) : (
              <div className="text-right">
                <p className="text-sm leading-5">
                  ${transferFee?.feeUsd ?? "0.00"}
                </p>
                {transferFee?.fee && (
                  <p className="text-xs leading-5" id="fee">
                    {transferFee.fee}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        <Button
          className="text-base"
          type="primary"
          id={"sendFT"}
          block
          onClick={handleSubmit(submit)}
          icon={<IconCmpArrow className="rotate-[135deg]" />}
        >
          Send
        </Button>

        <div className="flex justify-between text-sm text-gray-400">
          <p>Current balance</p>
          <div className="flex items-center space-x-0.5">
            {!!balance?.balance ? (
              <span id="balance">
                {balance.balance.toString()} {selectedTokenCurrency}
              </span>
            ) : (
              <Spinner className="w-3 h-3 text-gray-400" />
            )}
          </div>
        </div>
      </div>
    </SmoothBlurredLoader>
  )
}
