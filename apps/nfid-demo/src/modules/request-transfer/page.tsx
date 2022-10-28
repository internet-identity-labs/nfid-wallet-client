import { Button, H1, Input } from "@nfid-frontend/ui"
import { minMax } from "@nfid-frontend/validation"
import { requestTransfer, RequestTransferParams } from "@nfid/wallet"
import clsx from "clsx"
import React from "react"
import { Helmet } from "react-helmet-async"
import { useForm } from "react-hook-form"

import { RouteRequestTransfer } from "./route"

export const PageRequestTransfer: React.FC = () => {
  const title = "Request transfer"

  const handleRequestTransfer = React.useCallback(
    async ({ to, amount }: RequestTransferParams) => {
      console.log(">> handleRequestTransfer", { to, amount })

      const result = await requestTransfer(
        { to, amount },
        { provider: new URL("http://localhost:9090/wallet/request-transfer") },
      )
      console.log(">> handleRequestTransfer", { result })
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
    formState: { errors, isValid },
    register,
    watch,
    handleSubmit,
  } = useForm<RequestTransferParams>({
    mode: "onChange",
  })
  console.log(">> RequestTransferForm", { errors, isValid })

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
            {...register("to", {
              required: true,
            })}
            errorText={errors.to?.message}
            inputClassName={clsx("border")}
          />
          <Input
            labelText="Amount"
            type="number"
            errorText={errors.amount?.message}
            min={0}
            {...register("amount", {
              required: true,
              validate: minMax({
                min: 0,
                toLowError: "Amount cannot be negative",
              }),
            })}
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
      <div className={clsx("flex space-x-1 w-full")}>
        <div
          className={clsx(
            "block border border-gray-200 rounded-xl",
            "px-5 py-4",
            "sm:px-[30px] sm:py-[26px]",
          )}
        >
          <h2 className={clsx("font-bold")}>Form state:</h2>
          <pre>{JSON.stringify({ isValid }, null, 2)}</pre>
        </div>
        <div
          className={clsx(
            "block border border-gray-200 rounded-xl",
            "px-5 py-4",
            "sm:px-[30px] sm:py-[26px]",
          )}
        >
          <h2 className={clsx("font-bold")}>Form input:</h2>
          <pre>
            {JSON.stringify(
              { to: watch("to"), amount: watch("amount") },
              null,
              2,
            )}
          </pre>
        </div>
      </div>
    </>
  )
}
