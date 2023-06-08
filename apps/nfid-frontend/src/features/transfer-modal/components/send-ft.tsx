import clsx from "clsx"
import { Token } from "packages/integration/src/lib/asset/types"
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
  BlurredLoader,
  sumRules,
} from "@nfid-frontend/ui"
import { TokenMetadata } from "@nfid/integration/token/dip-20"

import { Spinner } from "frontend/ui/atoms/loader/spinner"
import { resetCachesByKey } from "frontend/ui/connnector/cache"
import {
  getAllTokensOptions,
  getConnector,
} from "frontend/ui/connnector/transfer-modal/transfer-factory"
import { TransferModalType } from "frontend/ui/connnector/transfer-modal/types"
import { ITransferConfig } from "frontend/ui/connnector/transfer-modal/types"
import { Blockchain } from "frontend/ui/connnector/types"

import { validateTransferAmountField } from "../utils/validations"
import { ITransferSuccess } from "./success"

interface ITransferFT {
  preselectedTokenCurrency: string
  preselectedAccountAddress: string
  preselectedTokenBlockchain?: string
  onTransferPromise: (data: ITransferSuccess) => void
}

export const TransferFT = ({
  preselectedTokenCurrency,
  preselectedAccountAddress = "",
  preselectedTokenBlockchain = Blockchain.IC,
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
    ITransferConfig & (TokenMetadata | Token)
  >(
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
        resetField("to")
      },
    },
  )

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
    selectedConnector && tokenMetadata
      ? [selectedConnector, getValues, tokenMetadata, "transferFee"]
      : null,
    ([selectedConnector, getValues, token]) =>
      selectedConnector?.getFee({
        amount: getValues("amount"),
        to: getValues("to"),
        currency: selectedTokenCurrency,
        contract:
          "contractAddress" in token ? String(token.contractAddress) : "",
      }),
    {
      refreshInterval: 5000,
    },
  )

  const { data: rate } = useSWR(
    selectedConnector ? [selectedTokenCurrency, "rate"] : null,
    ([selectedTokenCurrency]) =>
      selectedConnector?.getRate(selectedTokenCurrency),
  )

  const submit = useCallback(
    async (values: { amount: number; to: string }) => {
      if (!tokenMetadata) return toast.error("Token metadata has not loaded")
      if (!selectedConnector) return toast.error("No selected connector")
      if (values.to === selectedAccountAddress)
        return setError("to", {
          type: "value",
          message: "You can't transfer to the same wallet",
        })

      onTransferPromise({
        assetImg: tokenMetadata?.icon ?? "",
        initialPromise: new Promise(async (resolve) => {
          const res = await selectedConnector.transfer({
            to: values.to,
            amount: values.amount,
            currency: selectedTokenCurrency,
            identity: await selectedConnector?.getIdentity(
              selectedAccountAddress,
            ),
            contract:
              "contractAddress" in tokenMetadata
                ? String(tokenMetadata.contractAddress)
                : "",
          })

          resolve(res)
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
    },
    [
      onTransferPromise,
      rate,
      refetchBalance,
      selectedAccountAddress,
      selectedConnector,
      selectedTokenCurrency,
      setError,
      tokenMetadata,
    ],
  )

  const loadingMessage = useMemo(() => {
    if (isTokensLoading) return "Fetching supported tokens..."
    if (isConnectorLoading || isMetadataLoading)
      return "Loading token config..."
    if (isAccountsLoading) return "Loading accounts..."
  }, [
    isAccountsLoading,
    isConnectorLoading,
    isMetadataLoading,
    isTokensLoading,
  ])

  return (
    <BlurredLoader
      className="text-xs"
      overlayClassnames="rounded-xl"
      isLoading={
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
              validate: validateTransferAmountField(
                balance?.balance,
                transferFee?.fee?.replace(/[^0-9.]/g, ""),
              ),
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
            onSelect={(value) => {
              const arrayValue = value.split("&")
              if (arrayValue.length < 2) return

              setSelectedTokenCurrency(arrayValue[0])
              setSelectedTokenBlockchain(arrayValue[1])
            }}
            preselectedValue={`${selectedTokenCurrency}&${selectedTokenBlockchain}`}
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

                <p className="text-xs leading-5" id="fee">
                  {transferFee?.fee ?? `0.00 ${selectedTokenCurrency}`}
                </p>
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
            {!isBalanceLoading &&
            !isBalanceFetching &&
            !!balance?.balance?.length ? (
              <span id="balance">
                {balance.balance.toString()} {selectedTokenCurrency}
              </span>
            ) : (
              <Spinner className="w-3 h-3 text-gray-400" />
            )}
          </div>
        </div>
      </div>
    </BlurredLoader>
  )
}
