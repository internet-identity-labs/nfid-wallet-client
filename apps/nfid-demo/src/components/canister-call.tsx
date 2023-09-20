import { DelegationIdentity } from "@dfinity/identity"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { Button, Input } from "@nfid-frontend/ui"
import { NFID } from "@nfid/embed"

export const DemoCanisterCall = ({
  nfid,
  identity,
}: {
  nfid?: NFID
  identity?: DelegationIdentity
}) => {
  const [, setResponse] = useState({})
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

    setResponse(response)
  }

  return (
    <div className="space-y-2">
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
      <Input labelText="Parameters" {...register("parameters")} />
      <Button
        className="mt-3"
        onClick={handleSubmit(handleExecuteCanisterCall)}
      >
        Submit
      </Button>
    </div>
  )
}
