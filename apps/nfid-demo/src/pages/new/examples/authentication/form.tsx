import { useAuthenticationContext } from "apps/nfid-demo/src/context/authentication"
import React from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { ImSpinner } from "react-icons/im"

import { Button, Input } from "@nfid/ui"
import { ONE_HOUR_IN_MS } from "@nfid/config"

const CANISTER_IDS = [
  // "txkre-oyaaa-aaaap-qa3za-cai",
  "irshc-3aaaa-aaaam-absla-cai",
]

type AuthenticationFormValues = {
  maxTimeToLive: bigint
  derivationOrigin: string
  canisterIds: { canisterId: string; id?: string }[]
}

export const AuthenticationForm = ({
  submitButtonText,
  submitButtonId,
  submitButtonDisabled,
  isLoading,
  onSubmit,
}: {
  submitButtonText: string
  submitButtonId: string
  isLoading: boolean
  submitButtonDisabled: boolean
  onSubmit: (formValues: {
    targets: string[]
    maxTimeToLive: bigint
    derivationOrigin: string
  }) => void
}) => {
  const { config } = useAuthenticationContext()
  const defaultTargetCanisterIds = React.useMemo(() => {
    return config?.targets?.map((target) => ({ canisterId: target.toString() }))
  }, [config])

  console.debug("TargetCanisterForm", { config, defaultTargetCanisterIds })

  const { control, register, handleSubmit } = useForm<AuthenticationFormValues>(
    {
      defaultValues: {
        canisterIds: defaultTargetCanisterIds,
        maxTimeToLive: BigInt(ONE_HOUR_IN_MS) * BigInt(1000),
        derivationOrigin: "",
      },
    },
  )

  const { fields, append, remove } = useFieldArray({
    control,
    name: "canisterIds",
  })

  const prepareForm = React.useCallback(
    ({
      canisterIds,
      maxTimeToLive,
      derivationOrigin,
    }: AuthenticationFormValues) => {
      const targets = canisterIds.map(({ canisterId }) => canisterId)
      console.debug("handleSubmit", {
        targets,
        maxTimeToLive,
        derivationOrigin,
      })
      onSubmit({ targets, maxTimeToLive, derivationOrigin })
    },
    [onSubmit],
  )

  return (
    <form onSubmit={handleSubmit(prepareForm)} className="flex flex-col gap-4">
      <section className="flex flex-col gap-2">
        <Input
          labelText={"Delegation max time to live (ns)"}
          {...register("maxTimeToLive")} // Use index to name the input fields
        />
        <Input
          labelText={"Derivation origin"}
          {...register("derivationOrigin")} // Use index to name the input fields
          className="flex-1"
        />
        <ul className="flex flex-col gap-2">
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
        </ul>
      </section>
      <section className="flex gap-2">
        <Button
          as="div"
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
        <Button isSmall id={submitButtonId} disabled={submitButtonDisabled}>
          <div className={"flex items-center space-x-2"}>
            {isLoading ? <ImSpinner className={"animate-spin"} /> : ""}
            <div>{submitButtonText}</div>
          </div>
        </Button>
      </section>
    </form>
  )
}
