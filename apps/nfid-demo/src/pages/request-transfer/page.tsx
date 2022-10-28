import { Button, H1, Input } from "@nfid-frontend/ui"
import { minMax } from "@nfid-frontend/validation"
import { requestTransfer, RequestTransferParams } from "@nfid/wallet"
import clsx from "clsx"
import React from "react"
import { Helmet } from "react-helmet-async"
import { useForm } from "react-hook-form"
import { ImSpinner } from "react-icons/im"

import { RouteRequestTransfer } from "."
import { environment } from "../../environments/environment"
import { PageTemplate } from "../page-template"

const APPLICATION_LOGO_URL = "https%3A%2F%2Flogo.clearbit.com%2Fclearbit.com"

export const PageRequestTransfer: React.FC = () => {
  const title = "Request transfer"
  const [isLoading, toggleLoading] = React.useReducer(
    (isLoading) => !isLoading,
    false,
  )
  const [result, setResult] = React.useState({})

  const handleRequestTransfer = React.useCallback(
    async ({ to, amount }: RequestTransferParams) => {
      console.log(">> handleRequestTransfer", { to, amount })

      toggleLoading()
      setResult({})
      const result = await requestTransfer(
        { to, amount },
        {
          provider: new URL(
            `${environment.nfidProviderOrigin}/wallet/request-transfer?applicationName=RequestTransfer&applicationLogo=${APPLICATION_LOGO_URL}`,
          ),
        },
      )
      setResult(result)
      toggleLoading()
      console.log(">> handleRequestTransfer", { result })
    },
    [],
  )

  return (
    <PageTemplate title={title}>
      <div className={clsx("flex-col space-y-2")}>
        <H1>{title}</H1>
        <RequestTransferForm
          onSubmit={handleRequestTransfer}
          result={result}
          isLoading={isLoading}
        />
      </div>
    </PageTemplate>
  )
}

interface RequestTransferFormProps {
  result: any
  isLoading: boolean
  onSubmit: (params: RequestTransferParams) => Promise<void>
}

const RequestTransferForm: React.FC<RequestTransferFormProps> = ({
  result,
  isLoading,
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
            disabled={isLoading}
          />
          <Input
            labelText="Amount"
            type="number"
            errorText={errors.amount?.message}
            min={0}
            disabled={isLoading}
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
            disabled={!isValid || isLoading}
            className={"relative"}
          >
            {isLoading ? (
              <div className={clsx("flex items-center space-x-2")}>
                <ImSpinner className={clsx("animate-spin")} />
                <div>Waiting for approval...</div>
              </div>
            ) : (
              "Request transfer"
            )}
          </Button>
        </form>
      </div>
      <div className={clsx("flex space-x-2 w-full")}>
        <div
          className={clsx(
            "w-full border border-gray-200 rounded-xl",
            "px-5 py-4",
            "sm:px-[30px] sm:py-[26px]",
          )}
        >
          <h2 className={clsx("font-bold")}>Form state:</h2>
          <pre>{JSON.stringify({ isValid }, null, 2)}</pre>
        </div>
        <div
          className={clsx(
            "w-full border border-gray-200 rounded-xl",
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
        <div
          className={clsx(
            "w-full border border-gray-200 rounded-xl",
            "px-5 py-4",
            "sm:px-[30px] sm:py-[26px]",
          )}
        >
          <h2 className={clsx("font-bold")}>NFID response:</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      </div>
    </>
  )
}
