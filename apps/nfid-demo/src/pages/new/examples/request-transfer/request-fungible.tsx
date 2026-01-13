import { useAuthenticationContext } from "apps/nfid-demo/src/context/authentication"
import clsx from "clsx"
import toaster from "@nfid/ui/atoms/toast"
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"

import { Button, Input } from "@nfid/ui"
import { DelegationType } from "@nfid/embed"
import { E8S } from "@nfid/integration/token/constants"

import { ExampleError } from "../../error"
import { SectionTemplate } from "../../section"

const CODE_SNIPPET = `const { data: nfid } = useSWRImmutable("nfid", () =>
  NFID.init({ origin: NFID_PROVIDER_URL }),
)

const onRequestTransfer = useCallback(
  async (values: any) => {
    if (!nfid) return alert("NFID is not initialized")
    if (!values.receiver.length) return alert("Receiver should not be empty")
    if (!values.amount.length) return alert("Please enter an amount")

    const res = await nfid
      .requestTransferFT({
         receiver: values.receiver,
         amount: String(Number(values.amount) * E8S),
        })
       .catch((e: Error) => ({ error: e.message }))

     setResponse(res)
  },
  [nfid, receiver, refetchBalance],
)`

export const RequestFungibleTransfer = () => {
  const { nfid, identity, derivationOrigin } = useAuthenticationContext()
  const [response, setResponse] = useState("{}")

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      receiver: "",
      amount: "",
      memo: "",
    },
  })

  const onRequestTransfer = useCallback(
    async (values: any) => {
      if (!values.receiver.length) return alert("Receiver should not be empty")
      if (!values.amount.length) return alert("Please enter an amount")

      const res = await nfid
        ?.requestTransferFT({
          receiver: values.receiver,
          amount: String(Number(values.amount) * E8S),
          ...(values.memo ? { memo: BigInt(values.memo) } : {}),
          derivationOrigin,
        })
        .catch((e: Error) => ({ error: e.message }))

      setResponse(JSON.stringify(res, null, 2))
    },
    [nfid, derivationOrigin],
  )

  return (
    <SectionTemplate
      id="requestICPTransfer"
      title={"3. Request Fungible Token transfer"}
      subtitle={
        <>
          If a user is authenticated with their main wallet address, an
          <span
            className={clsx(
              "px-2 py-1 ml-1 text-xs text-white bg-gray-800 rounded-lg",
              "opacity-50 group-hover:opacity-100 transition-opacity",
            )}
          >
            requestTransferFT
          </span>{" "}
          method is exposed to request approval to transfer some amount of ICP
          from the user to a designated address.
        </>
      }
      codeSnippet={CODE_SNIPPET}
      jsonResponse={response}
      example={
        nfid?.getDelegationType() === DelegationType.ANONYMOUS ? (
          <ExampleError>You cannot update anonymous delegations</ExampleError>
        ) : (
          <div className="space-y-4">
            <Input
              id="inputICAddressFT"
              labelText="Receiver IC address"
              placeholder="39206df1ca32d2..."
              errorText={errors.receiver?.message}
              {...register("receiver", { required: "This field is required" })}
            />
            <Input
              id="inputICP"
              labelText="Amount ICP"
              placeholder="0.0001"
              errorText={errors.amount?.message}
              {...register("amount", {
                required: "This field is required",
                min: {
                  value: 0.00000001,
                  message: "Amount should be greater than 0",
                },
              })}
            />
            <Input
              id="inputMemo"
              labelText="Memo"
              placeholder="0"
              errorText={errors.memo?.message}
              {...register("memo", { valueAsNumber: true })}
            />

            <Button
              isSmall
              id="buttonRequestICP"
              onClick={
                identity
                  ? handleSubmit(onRequestTransfer)
                  : () => toaster.error("Please authenticate first")
              }
            >
              Request ICP transfer
            </Button>
          </div>
        )
      }
    />
  )
}
