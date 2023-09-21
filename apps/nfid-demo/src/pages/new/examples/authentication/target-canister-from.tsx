import { useAuthenticationContext } from "apps/nfid-demo/src/context/authentication"
import React from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { ImSpinner } from "react-icons/im"

import { Button, Input } from "@nfid-frontend/ui"

const CANISTER_IDS = [
  // "txkre-oyaaa-aaaap-qa3za-cai",
  "irshc-3aaaa-aaaam-absla-cai",
]

export const TargetCanisterForm = ({
  submitButtonText,
  submitButtonId,
  isLoading,
  onSubmit,
}: {
  submitButtonText: string
  submitButtonId: string
  isLoading: boolean
  onSubmit: (targets: string[]) => void
}) => {
  const { config } = useAuthenticationContext()
  const defaultTargetCanisterIds = React.useMemo(() => {
    return config?.targets?.map((target) => ({ canisterId: target.toString() }))
  }, [config])

  console.debug("TargetCanisterForm", { config, defaultTargetCanisterIds })

  const { control, watch, register } = useForm<{
    canisterIds: { canisterId: string; id?: string }[]
  }>({
    defaultValues: {
      canisterIds: defaultTargetCanisterIds,
    },
  })

  const { fields, append, remove } = useFieldArray({
    rules: { minLength: 4 },
    control,
    name: "canisterIds", // This should match the name of your array field
  })

  const canisterIds = watch("canisterIds")

  const handleSubmit = React.useCallback(() => {
    const targets = canisterIds.map(({ canisterId }) => canisterId)
    console.debug("handleSubmit", { targets, canisterIds })
    onSubmit(targets)
  }, [canisterIds, onSubmit])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {fields.map((field, index) => {
          return (
            <div key={field.id} className="flex gap-2 center">
              <Input
                labelText={`target canisterId ${index + 1}`}
                {...register(`canisterIds.${index}.canisterId`)} // Use index to name the input fields
                placeholder={`add canisterId ${index + 1}`}
                className="flex-1"
              />
              <div className="flex items-end flex-end">
                <Button
                  className="h-10"
                  type="stroke"
                  isSmall
                  onClick={() => remove(index)}
                >
                  delete
                </Button>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex gap-2">
        <Button
          id="buttonAddTargetCanisterId"
          type="stroke"
          isSmall
          onClick={() => {
            if (fields.length === 0) {
              return CANISTER_IDS.forEach((canisterId) => {
                append({ canisterId })
              })
            }
            append({ canisterId: "" })
          }}
        >
          Add target canisterId
        </Button>
        <Button isSmall id={submitButtonId} onClick={handleSubmit}>
          <div className={"flex items-center space-x-2"}>
            {isLoading ? <ImSpinner className={"animate-spin"} /> : ""}
            <div>{submitButtonText}</div>
          </div>
        </Button>
      </div>
    </div>
  )
}
