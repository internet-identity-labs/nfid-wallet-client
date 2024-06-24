import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"
import clsx from "clsx"
import { Token } from "packages/integration/src/lib/asset/types"
import { NoIcon } from "packages/ui/src/assets/no-icon"
import { pressHandler, pasteHandler } from "packages/utils"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import useSWR, { mutate } from "swr"

import {
  Button,
  ChooseModal,
  IconCmpArrow,
  IconCmpArrowRight,
  Label,
  BlurredLoader,
  sumRules,
} from "@nfid-frontend/ui"
import { truncateString } from "@nfid-frontend/utils"
import {
  RootWallet,
  registerTransaction,
  sendReceiveTracking,
} from "@nfid/integration"
import { E8S } from "@nfid/integration/token/constants"
import { ICRC1Metadata } from "@nfid/integration/token/icrc1"

import { getVaultWalletByAddress } from "frontend/features/vaults/utils"
import { useProfile } from "frontend/integration/identity-manager/queries"
import { Spinner } from "frontend/ui/atoms/loader/spinner"
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
  TickerAmount,
  formatAssetAmountRaw,
} from "frontend/ui/molecules/ticker-amount"

import {
  PRINCIPAL_LENGTH,
  MAX_DECIMAL_LENGTH,
  validateTransferAmountField,
} from "../utils/validations"
import { ITransferSuccess } from "./success"

interface ITransferFT {
  isVault: boolean
  preselectedTokenCurrency: string
  preselectedAccountAddress: string
  preselectedTokenBlockchain?: string
  preselectedTransferDestination?: string
  onTransferPromise: (data: ITransferSuccess) => void
}

export const TransferFT = ({
  isVault,
  preselectedTokenCurrency,
  preselectedAccountAddress = "",
  preselectedTokenBlockchain = Blockchain.IC,
  preselectedTransferDestination,
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

  const [amountInUSD, setAmountInUSD] = useState(0)

  const { profile, isLoading: isLoadingProfile } = useProfile()
  console.debug("TransferFT", {
    profile,
    isLoadingProfile,
    selectedTokenBlockchain,
    selectedTokenCurrency,
  })

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
    ITransferConfig & (ICRC1Metadata | Token)
  >(
    selectedConnector
      ? [selectedConnector, "tokenMetadata", selectedTokenCurrency]
      : null,
    async ([selectedConnector]) => {
      // if it's icrc1 token, we need to fetch token metadata
      if (selectedConnector.getTokenMetadata)
        return await selectedConnector.getTokenMetadata(selectedTokenCurrency)
      else return selectedConnector.getTokenConfig()
    },
  )

  const {
    data: accountsOptions,
    isLoading: isAccountsLoading,
    isValidating: isAccountsValidating,
  } = useSWR(
    selectedConnector ? [selectedConnector, isVault, "accountsOptions"] : null,
    ([connector, isVault]) =>
      connector.getAccountsOptions({
        currency: selectedTokenCurrency,
        isVault,
        isRootOnly: true,
      }),
  )

  useEffect(() => {
    if (!accountsOptions?.length) return
    !preselectedAccountAddress.length &&
      setSelectedAccountAddress(accountsOptions[0].options[0].value)
  }, [accountsOptions, preselectedAccountAddress.length])

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
    [isVault, "getAllTokensOptions"],
    ([isVault]) => getAllTokensOptions(isVault),
  )

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    resetField,
    getValues,
  } = useForm({
    mode: "all",
    defaultValues: {
      amount: undefined as any as string,
      to: preselectedTransferDestination ?? "",
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
        amount: +getValues("amount"),
        to: getValues("to"),
        currency: selectedTokenCurrency,
        contract:
          "contractAddress" in token ? String(token.contractAddress) : "",
      }),
    {
      refreshInterval: 5000,
    },
  )

  const { data: decimals } = useSWR(
    selectedConnector ? [selectedTokenCurrency, "decimals"] : null,
    ([selectedTokenCurrency]) =>
      selectedConnector?.getDecimals(selectedTokenCurrency),
  )

  const { data: rate } = useSWR(
    selectedConnector ? [selectedTokenCurrency, "rate"] : null,
    ([selectedTokenCurrency]) =>
      selectedConnector?.getRate(selectedTokenCurrency),
  )

  const handleTrackTransfer = useCallback(
    (amount: string) => {
      const token = selectedConnector?.getTokenConfig()
      if (!token) return

      sendReceiveTracking.sendToken({
        network: token.blockchain,
        destinationType: "address",
        tokenName: selectedTokenCurrency,
        tokenType: "fungible",
        tokenStandard: token.tokenStandard,
        amount: amount,
        fee: transferFee ?? 0,
      })
    },
    [selectedConnector, selectedTokenCurrency, transferFee],
  )

  const maxHandler = () => {
    if (transferFee && balance) {
      const val = balance - transferFee

      if (val <= 0) return

      const formattedValue = formatAssetAmountRaw(val, decimals!)

      setValue("amount", formattedValue)
      if (!balance || !rate) return
      setAmountInUSD(+formattedValue)
    }
  }

  const submit = useCallback(
    async (values: { amount: string; to: string }) => {
      if (!tokenMetadata) return toast.error("Token metadata has not loaded")
      if (!selectedConnector) return toast.error("No selected connector")

      if (isVault) {
        return onTransferPromise({
          assetImg: tokenMetadata?.icon ?? "",
          initialPromise: new Promise(async (resolve) => {
            const wallet = await getVaultWalletByAddress(selectedAccountAddress)

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
      }

      onTransferPromise({
        assetImg: tokenMetadata?.icon ?? "",
        initialPromise: new Promise(async (resolve) => {
          await calculateFee()
          const res = await selectedConnector.transfer({
            to: values.to,
            canisterId: tokenMetadata.canisterId,
            fee: transferFee! || undefined,
            amount:
              selectedTokenCurrency !== "ICP"
                ? +values.amount * 10 ** decimals!
                : +values.amount,
            currency: selectedTokenCurrency,
            identity: await selectedConnector?.getIdentity(
              selectedAccountAddress,
              tokenMetadata?.canisterId!,
            ),
            contract:
              "contractAddress" in tokenMetadata
                ? String(tokenMetadata.contractAddress)
                : "",
          })

          handleTrackTransfer(values.amount)
          resolve(res)
        }),
        title: `${Number(values.amount)
          .toFixed(MAX_DECIMAL_LENGTH)
          .replace(/\.?0+$/, "")} ${selectedTokenCurrency}`,
        subTitle: `${(Number(values.amount) * Number(rate)).toFixed(2)} USD`,
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
          mutate(
            (key: any) =>
              key && Array.isArray(key) && key[0] === "useTokenConfig",
          )
        },
        isAssetPadding: true,
        duration: tokenMetadata.duration,
      })
    },
    [
      calculateFee,
      handleTrackTransfer,
      isVault,
      onTransferPromise,
      rate,
      refetchBalance,
      selectedAccountAddress,
      selectedConnector,
      selectedTokenCurrency,
      tokenMetadata,
      transferFee,
      decimals,
    ],
  )

  const loadingMessage = useMemo(() => {
    if (isLoadingProfile) return "Fetching account information..."
    if (isTokensLoading) return "Fetching supported tokens..."
    if (isConnectorLoading || isMetadataLoading)
      return "Loading token config..."
    if (isAccountsLoading || isAccountsValidating) return "Loading accounts..."
  }, [
    isLoadingProfile,
    isTokensLoading,
    isConnectorLoading,
    isMetadataLoading,
    isAccountsLoading,
    isAccountsValidating,
  ])

  return (
    <BlurredLoader
      className="text-xs"
      overlayClassnames="rounded-xl"
      isLoading={
        isConnectorLoading ||
        isAccountsLoading ||
        isAccountsValidating ||
        isMetadataLoading ||
        isTokensLoading
      }
      loadingMessage={loadingMessage}
    >
      <div className="flex justify-between">
        <p className="mb-1">Amount to send</p>
        <p onClick={maxHandler} className="text-blue-600 cursor-pointer">
          Max
        </p>
      </div>
      <div className="flex flex-col justify-between h-full pb-20">
        <div
          className={clsx(
            "border rounded-md flex items-center justify-between pl-4 pr-5 h-14 mb-4",
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
            type="text"
            id="amount"
            min={0.0}
            {...register("amount", {
              required: sumRules.errorMessages.required,
              validate: validateTransferAmountField(
                formatAssetAmountRaw(balance!, decimals!),
                formatAssetAmountRaw(transferFee!, decimals!),
              ),
              valueAsNumber: true,
              onBlur: calculateFee,
              onChange: (e) => {
                if (!rate) return
                setAmountInUSD(e.target.value)
              },
            })}
            onKeyDown={pressHandler}
            onPaste={pasteHandler}
          />
          <div
            className={clsx(
              "absolute mt-[75px] left-5",
              "text-xs py-1 text-red",
            )}
          >
            {errors.amount?.message}
          </div>
          {!!rate && (
            <p
              className={clsx(
                "absolute mt-[75px] right-[20px]",
                "text-xs pt-[4px] text-gray-400 text-sm",
              )}
            >
              {!!rate && (
                <TickerAmount
                  symbol={tokenMetadata!.symbol}
                  value={amountInUSD}
                  decimals={undefined}
                  usdRate={rate}
                />
              )}
            </p>
          )}
          <ChooseModal
            optionGroups={tokenOptions ?? []}
            title="Asset to send"
            type="trigger"
            onSelect={(value) => {
              const arrayValue = value.split("&")
              if (arrayValue.length < 2) return

              resetField("amount")
              resetField("to")
              setAmountInUSD(0)
              setSelectedTokenCurrency(arrayValue[0])
              setSelectedTokenBlockchain(arrayValue[1])
            }}
            onOpen={sendReceiveTracking.supportedTokenModalOpened}
            preselectedValue={`${selectedTokenCurrency}&${selectedTokenBlockchain}`}
            isSmooth
            trigger={
              <div
                id={`token_${selectedTokenCurrency}`}
                className="flex items-center cursor-pointer shrink-0"
              >
                {!tokenMetadata?.icon ? (
                  <NoIcon className="w-[40px] h-[40px] mr-1.5" />
                ) : (
                  <img
                    className="w-[26px] mr-1.5"
                    src={tokenMetadata?.icon}
                    alt={selectedTokenCurrency}
                  />
                )}
                <p className="text-lg font-semibold">{selectedTokenCurrency}</p>
                <IconCmpArrowRight className="ml-4" />
              </div>
            }
          />
        </div>
        {isVault && (
          <ChooseModal
            label="From"
            title="From"
            optionGroups={accountsOptions ?? []}
            preselectedValue={selectedAccountAddress}
            onSelect={setSelectedAccountAddress}
            warningText={
              isVault ? undefined : (
                <div className="w-[337px]">
                  Starting September 1, 2023, assets from external applications
                  will not be displayed in NFID. <br /> <br /> To manage those
                  assets in NFID, transfer them to your NFID Wallet. Otherwise,
                  you’ll only have access through the application’s website.
                </div>
              )
            }
          />
        )}
        <ChooseModal
          type="input"
          label="To"
          title={"Choose an account"}
          optionGroups={
            profile?.wallet === RootWallet.NFID ? [] : accountsOptions ?? []
          }
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
          preselectedValue={preselectedTransferDestination}
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
                <p className="text-sm leading-5" id="fee">
                  <TickerAmount
                    value={transferFee!}
                    decimals={decimals}
                    symbol={selectedTokenCurrency}
                  />
                  {!!rate && (
                    <span className="block text-xs">
                      <TickerAmount
                        value={transferFee!}
                        decimals={decimals}
                        symbol={selectedTokenCurrency}
                        usdRate={rate}
                      />
                    </span>
                  )}
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
        <div
          className={clsx(
            "bg-gray-50 flex flex-col text-sm text-gray-500",
            "text-xs absolute bottom-0 left-0 w-full px-5 py-3 round-b-xl",
          )}
        >
          <div className="flex items-center justify-between">
            <p>Wallet address</p>
            <p>
              Balance:&nbsp;
              {!isBalanceLoading && !isBalanceFetching ? (
                <span id="balance">
                  <TickerAmount
                    value={balance!}
                    decimals={decimals}
                    symbol={selectedTokenCurrency}
                  />
                </span>
              ) : (
                <Spinner className="w-3 h-3 text-gray-400" />
              )}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p>{truncateString(selectedAccountAddress, 6, 4)}</p>
            {!!rate && (
              <div className="flex items-center space-x-0.5">
                {!isBalanceLoading && !isBalanceFetching ? (
                  <TickerAmount
                    value={balance!}
                    decimals={decimals}
                    symbol={selectedTokenCurrency}
                    usdRate={rate}
                  />
                ) : (
                  <Spinner className="w-3 h-3 text-gray-400" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </BlurredLoader>
  )
}
