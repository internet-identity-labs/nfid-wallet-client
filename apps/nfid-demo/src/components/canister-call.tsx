import { DelegationIdentity } from "@dfinity/identity"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { Button, H4, Input } from "@nfid-frontend/ui"
import { NFID } from "@nfid/embed"

export const DemoCanisterCall = ({
  nfid,
  identity,
}: {
  nfid?: NFID
  identity?: DelegationIdentity
}) => {
  const [response, setResponse] = useState({})
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
    <div className="grid grid-cols-2 gap-10 p-5">
      <div className="w-full h-full">
        <H4>Request canister call</H4>
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
      </div>
      <div className="w-full h-full">
        <div className="w-full p-6 px-5 mt-4 bg-gray-900 rounded-lg shadow-md">
          <h3 className="mb-4 text-xl text-white">Canister call logs</h3>
          <pre className="p-4 overflow-x-auto text-sm text-white bg-gray-800 rounded">
            <code>{JSON.stringify(response, null, 4)}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
