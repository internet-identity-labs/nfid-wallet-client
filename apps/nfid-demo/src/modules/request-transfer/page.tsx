import { Button, H1, Input } from "@nfid-frontend/ui"
import { requestTransfer, RequestTransferParams } from "@nfid/wallet"
import clsx from "clsx"
import { watch } from "fs"
import React from "react"
import { Helmet } from "react-helmet-async"
import { useForm } from "react-hook-form"
import { BiWallet } from "react-icons/bi"

import { RouteRequestTransfer } from "./route"

interface PagePhoneNumberVerificationProps {}

export const PageRequestTransfer: React.FC<
  PagePhoneNumberVerificationProps
> = () => {
  const title = "Request transfer"

  const handleRequestTransfer = React.useCallback(
    async ({ to, amount }: RequestTransferParams) => {
      console.log(">> handleRequestTransfer", { to, amount })

      const result = await requestTransfer({ to, amount })
    },
    [],
  )

  return (
    <RouteRequestTransfer>
      <Helmet>
        <title>NFIDemo | {title}</title>
      </Helmet>
      <div className={clsx("flex-col space-y-2")}>
        <H1>{title}</H1>
        <RequestTransferForm onSubmit={handleRequestTransfer} />
      </div>
    </RouteRequestTransfer>
  )
}

interface RequestTransferFormProps {
  onSubmit: (params: RequestTransferParams) => Promise<void>
}

const RequestTransferForm: React.FC<RequestTransferFormProps> = ({
  onSubmit,
}) => {
  const {
    formState: { isValid, errors },
    register,
    watch,
    handleSubmit,
  } = useForm<RequestTransferParams>()
  console.log(">> RequestTransferForm", { isValid })

  return (
    <>
      <div
        className={clsx(
          "block border border-gray-200 rounded-xl",
          "px-5 py-4",
          "sm:px-[30px] sm:py-[26px]",
        )}
      >
        <form>
          <Input
            labelText="To"
            type="string"
            {...register("to", { required: true })}
            errorText={errors.to?.message}
            inputClassName={clsx("border")}
          />
          <Input
            labelText="Amount"
            type="string"
            errorText={errors.amount?.message}
            {...register("amount", { required: true })}
            inputClassName={clsx("border")}
          />
          <Button
            secondary
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid}
          >
            Request transfer
          </Button>
        </form>
      </div>
      <div
        className={clsx(
          "block border border-gray-200 rounded-xl",
          "px-5 py-4",
          "sm:px-[30px] sm:py-[26px]",
        )}
      >
        <pre>
          {JSON.stringify(
            { to: watch("to"), amount: watch("amount") },
            null,
            2,
          )}
        </pre>
      </div>
    </>
  )
}
