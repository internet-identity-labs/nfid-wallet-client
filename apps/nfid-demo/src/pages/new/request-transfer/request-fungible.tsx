import { useAuthenticationContext } from "apps/nfid-demo/src/context/authentication"
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { Button, Input, Tooltip } from "@nfid-frontend/ui"
import { E8S } from "@nfid/integration/token/icp"

import { SectionTemplate } from "../section"

export const RequestFungibleTransfer = () => {
  const { nfid, identity } = useAuthenticationContext()
  const [response, setResponse] = useState("{}")

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      amount: "",
      receiver: "",
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
        })
        .catch((e: Error) => ({ error: e.message }))

      setResponse(JSON.stringify(res, null, 2))
    },
    [nfid],
  )

  return (
    <SectionTemplate
      title={"3. Request transfer"}
      method="nfid.requestTransferFT()"
      subtitle={
        "To use global delegations, you need provide at least one target canisterID"
      }
      codeSnippet={`const { data: nfid } = useSWRImmutable("nfid", () =>
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
)`}
      jsonResponse={response}
      example={
        <div className="space-y-4">
          <Input
            id="inputICAddressFT"
            labelText="Receiver IC address"
            placeholder="39206df1ca32d2..."
            errorText={errors.receiver?.message}
            {...register("receiver", { required: "This field is required" })}
          />
          <Input
            id="inputAmount"
            labelText="Amount ICP"
            placeholder="0.0001"
            errorText={errors.amount?.message}
            {...register("amount", { required: "This field is required" })}
          />

          <Button
            isSmall
            id="buttonRequestICP"
            onClick={
              identity
                ? handleSubmit(onRequestTransfer)
                : () => toast.error("Please authenticate first")
            }
          >
            Request ICP transfer
          </Button>
        </div>
      }
    />
  )
}
