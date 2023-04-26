import clsx from "clsx"
import { useCallback, useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { TokenConfig } from "src/ui/view-model/fungible-asset/types"

import {
  BlurredLoader,
  Button,
  ChooseModal,
  IconCmpArrow,
  IconCmpArrowRight,
  Image,
  sumRules,
} from "@nfid-frontend/ui"

import { useAllToken } from "frontend/features/fungable-token/use-all-token"
import {
  useAllWallets,
  Wallet,
} from "frontend/integration/wallet/hooks/use-all-wallets"

import { useTokenOptions } from "../hooks/use-token-options"
import { useWalletOptions } from "../hooks/use-wallets-options"
import { transformToAddress } from "../utils/transform-to-address"
import {
  makeAddressFieldValidation,
  validateTransferAmountField,
} from "../utils/validations"

interface ITransferFT {
  assignToken: (token: TokenConfig) => void
  assignSourceWallet: (value: string) => void
  assignReceiverWallet: (value: string) => void
  assignFromAccount: (value: Wallet) => void
  assignAmount: (value: string) => void
  selectedToken?: TokenConfig
  selectedSourceWallet?: string
  selectedSourceAccount?: Wallet
  selectedReceiverWallet?: string
  onSubmit: () => void
}

export const TransferFT = ({
  assignToken,
  assignSourceWallet,
  assignReceiverWallet,
  assignFromAccount,
  assignAmount,
  selectedToken,
  selectedSourceWallet,
  selectedReceiverWallet,
  selectedSourceAccount,
  onSubmit,
}: ITransferFT) => {
  const { walletOptions } = useWalletOptions(selectedToken?.currency ?? "ICP")
  const { tokenOptions } = useTokenOptions()
  const { token: allTokens } = useAllToken()
  const { wallets } = useAllWallets()

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    setError,
    resetField,
  } = useForm({
    mode: "all",
    defaultValues: {
      amount: undefined as any as number,
      from: selectedSourceWallet ?? "",
      to: selectedReceiverWallet ?? "",
    },
  })

  const setFullAmount = useCallback(() => {
    if (!selectedToken || !selectedToken.balance)
      return toast.error("No selected token or selected token has no balance", {
        toastId: "unexpectedTransferError",
      })

    const amount =
      BigInt(
        selectedSourceAccount?.balance[selectedToken.currency] ??
          selectedToken.fee,
      ) - selectedToken.fee

    if (!amount || typeof amount !== "bigint")
      return toast.error("Amount is invalid", {
        toastId: "unexpectedTransferError",
      })

    if (amount < 0) {
      setValue("amount", 0)
      setError("amount", { message: "Insufficient funds" })
      setTimeout(() => {
        resetField("amount")
      }, 2000)
    } else {
      resetField("amount")
      setValue("amount", Number(selectedToken.toPresentation(amount)))
    }
  }, [
    selectedToken,
    selectedSourceAccount?.balance,
    setValue,
    setError,
    resetField,
  ])

  const handleSelectToken = useCallback(
    (value: string) => {
      const token = allTokens.find((t) => t.currency === value)
      if (!token) return

      assignToken(token)
      setValue("from", walletOptions[0].options[0]?.value)
    },
    [allTokens, assignToken, setValue, walletOptions],
  )
  const handleSelectWallet = useCallback(
    (value: string) => {
      const account = wallets?.find((w) =>
        [
          w.principal.toText(),
          w.ethAddress,
          w.btcAddress,
          w.accountId,
        ].includes(value),
      )
      if (!account) return

      assignFromAccount(account)
      assignSourceWallet(value)
    },
    [assignFromAccount, assignSourceWallet, wallets],
  )

  const submit = useCallback(
    (values: any) => {
      if (!selectedToken)
        return toast.error(
          "No selected token or selected token has no balance",
          {
            toastId: "unexpectedTransferError",
          },
        )
      if (values.from === values.to)
        return setError("to", {
          type: "value",
          message: "You can't transfer to the same wallet",
        })
      assignAmount(values.amount)
      assignReceiverWallet(
        transformToAddress(values.to, selectedToken?.tokenStandard),
      )

      onSubmit()
    },
    [assignAmount, assignReceiverWallet, onSubmit, selectedToken, setError],
  )

  useEffect(() => {
    if (!selectedToken && allTokens.length) assignToken(allTokens[0])
  }, [allTokens, assignToken, selectedToken])

  useEffect(() => {
    assignSourceWallet(walletOptions[0].options[0]?.value)
  }, [walletOptions]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BlurredLoader
      className="!p-0 text-xs"
      overlayClassnames="rounded-xl"
      isLoading={!selectedSourceWallet}
    >
      <p className="mb-1">Amount to send</p>
      <div
        className={clsx(
          "border rounded-md flex items-center justify-between pl-4 pr-5 h-20",
          errors.amount ? "ring border-red-600 ring-red-100" : "border-black",
        )}
      >
        <input
          className={clsx(
            "min-w-0 text-3xl placeholder:text-black",
            "outline-none border-none h-[66px] focus:ring-0",
            "p-0",
          )}
          placeholder="0.00"
          type="number"
          id="amount"
          min={0.0}
          {...register("amount", {
            required: sumRules.errorMessages.required,
            validate: validateTransferAmountField(
              selectedToken?.toPresentation(
                selectedSourceAccount?.balance[selectedToken.currency],
              ),
            ),
            valueAsNumber: true,
          })}
        />
        <ChooseModal
          optionGroups={tokenOptions}
          title="Choose an asset"
          type="trigger"
          onSelect={handleSelectToken}
          isFirstPreselected={false}
          trigger={
            <div
              id={`token_${selectedToken?.currency}`}
              className="flex items-center cursor-pointer shrink-0"
            >
              <Image
                className="w-[26px] mr-1.5"
                src={selectedToken?.icon}
                alt={selectedToken?.currency}
              />
              <p className="text-lg font-semibold">{selectedToken?.currency}</p>
              <IconCmpArrowRight className="ml-4" />
            </div>
          }
        />
      </div>
      <div className="flex items-center justify-between mt-2 mb-3.5">
        <p
          id={"balance"}
          className={clsx(errors.amount ? "text-red-600" : "text-gray-400")}
        >
          Balance:{" "}
          <span
            className="text-black underline cursor-pointer decoration-dotted"
            onClick={setFullAmount}
          >
            {selectedToken?.toPresentation(
              selectedSourceAccount?.balance[selectedToken.currency],
            )}
          </span>
        </p>
        <p id={"transfer_fee"} className="text-gray-400">
          Transfer fee:{" "}
          {`${selectedToken?.toPresentation(selectedToken?.fee)} ${
            selectedToken?.feeCurrency ?? selectedToken?.currency
          }`}
        </p>
      </div>
      <div className="mt-4 space-y-5">
        <ChooseModal
          optionGroups={walletOptions}
          preselectedValue={selectedSourceWallet}
          label="From"
          title={"Choose an account"}
          onSelect={(value) => {
            setValue("from", value)
            handleSelectWallet(value)
          }}
        />
        <ChooseModal
          label="To"
          optionGroups={walletOptions}
          title={"Choose an account"}
          onSelect={(value) => {
            resetField("to")
            setValue("to", value)
          }}
          type="input"
          placeholder={
            selectedToken?.tokenStandard === "ICP"
              ? "Recipient principal or account ID"
              : "Recipient principal"
          }
          isFirstPreselected={false}
          errorText={errors.to?.message}
          registerFunction={register("to", {
            required: "This field cannot be empty",
            validate: makeAddressFieldValidation(
              selectedToken?.tokenStandard ?? "ICP",
            ),
          })}
        />
        <Button
          className="text-base !mt-[35px]"
          type="primary"
          id={"sendFT"}
          block
          onClick={handleSubmit(submit)}
          icon={<IconCmpArrow className="rotate-[135deg]" />}
        >
          Send
        </Button>
      </div>
    </BlurredLoader>
  )
}
