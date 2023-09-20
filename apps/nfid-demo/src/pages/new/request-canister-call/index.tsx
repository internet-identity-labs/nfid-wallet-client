import { useAuthenticationContext } from "apps/nfid-demo/src/context/authentication"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { Button, Input } from "@nfid-frontend/ui"

import { SectionTemplate } from "../section"

export const RequestCanisterCall = () => {
  const { nfid, identity } = useAuthenticationContext()
  const [response, setResponse] = useState("{}")
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      canisterId: "",
      method: "",
      parameters: "",
    },
  })

  const handleExecuteCanisterCall = async (values: any) => {
    if (!nfid) return alert("NFID is not initialized")

    const response = await nfid
      .requestCanisterCall({
        method: values.method,
        canisterId: values.canisterId,
        parameters: values.parameters.length ? values.parameters : "",
      })
      .catch((e: Error) => ({ error: e.message }))

    setResponse(JSON.stringify(response, null, 2))
  }

  return (
    <SectionTemplate
      id="requestCanisterCall"
      title={"5. Request canister call"}
      method="nfid.requestCanisterCall()"
      subtitle={
        "To use global delegations, you need provide at least one target canisterID"
      }
      codeSnippet={`const { data: nfid } = useSWRImmutable("nfid", () =>
  NFID.init({ origin: NFID_PROVIDER_URL }),
)
  
const onRequestTransfer = useCallback(
  async (values: any) => {
    if (!nfid) return alert("NFID is not initialized")
    if (!values.method.length) return alert("Method should not be empty")
    if (!values.canisterId.length) return alert("CanisterId should not be empty")

    const res = await nfid
      .requestCanisterCall({
        method: values.method,
        canisterId: values.canisterId,
        parameters: values.parameters.length ? values.parameters : "",
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
            labelText="Canister ID"
            errorText={errors.canisterId?.message}
            placeholder="74gpt-tiaaa-aaaak-aacaa-cai"
            {...register("canisterId", { required: "This field is required" })}
          />
          <Input
            labelText="Method name"
            errorText={errors.method?.message}
            placeholder="lookup"
            {...register("method", { required: "This field is required" })}
          />
          <Input
            labelText="Parameters"
            errorText={errors.parameters?.message}
            placeholder=""
            {...register("parameters")}
          />

          <Button
            isSmall
            id="buttonRequestICP"
            onClick={
              identity
                ? handleSubmit(handleExecuteCanisterCall)
                : () => toast.error("Please authenticate first")
            }
          >
            Submit
          </Button>
        </div>
      }
    />
  )
}
