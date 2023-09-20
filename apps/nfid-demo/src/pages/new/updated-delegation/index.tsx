import { Identity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import { useAuthenticationContext } from "apps/nfid-demo/src/context/authentication"
import { useAuthentication } from "apps/nfid-demo/src/hooks/useAuthentication"
import React from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { ImSpinner } from "react-icons/im"
import { identity } from "rxjs"

import { Button, Input } from "@nfid-frontend/ui"
import { DelegationType } from "@nfid/embed"

import { SectionTemplate } from "../section"

const CODE_SNIPPET = `
const nfid = await NFID.init({ origin: NFID_PROVIDER_URL })
nfid.updateGlobalDelegation()
`

const ExampleForm = ({
  isLoading,
  onSubmit,
}: {
  isLoading: boolean
  onSubmit: (targets: string[]) => void
}) => {
  const { config } = useAuthenticationContext()
  const defaultTargetCanisterIds = React.useMemo(() => {
    return config?.targets?.map((target) => ({ canisterId: target.toString() }))
  }, [config])

  const { control, register } = useForm<{
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

  const handleSubmit = React.useCallback(() => {
    const targets = fields.map(({ canisterId }) => canisterId)
    onSubmit(targets)
  }, [fields, onSubmit])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {fields.map((field, index) => {
          console.debug("form", { field, index })
          return (
            <div key={field.id} className="flex gap-2 center">
              <Input
                labelText={`target canisterId ${index + 1}`}
                {...register(`canisterIds.${index}.canisterId`)} // Use index to name the input fields
                // defaultValue={field.name} // Use defaultValue for pre-filling fields
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
          type="stroke"
          isSmall
          onClick={() => {
            append({ canisterId: "" })
          }}
        >
          Add target canisterId
        </Button>
        <Button isSmall id="buttonRequestICP" onClick={handleSubmit}>
          <div className={"flex items-center space-x-2"}>
            {isLoading ? <ImSpinner className={"animate-spin"} /> : ""}
            <div>update delegation</div>
          </div>
        </Button>
      </div>
    </div>
  )
}

export const UpdateDelegation = () => {
  const { nfid } = useAuthenticationContext()
  const { targetCanisterIds } = useAuthentication()

  const [loading, setLoading] = React.useState<boolean>(false)
  const [response, setResponse] = React.useState<Identity | undefined>()

  console.debug("UpdateDelegation", { targetCanisterIds })

  const handleUpdateGlobalDelegation = React.useCallback(
    async (targets: string[]) => {
      if (!nfid) throw new Error("NFID not initialized")
      setLoading(true)
      const response = await nfid.updateGlobalDelegation({
        targets,
      })
      setResponse(response)
      setLoading(false)
    },
    [nfid],
  )

  const Example = () => {
    if (nfid?.getDelegationType() === DelegationType.ANONYMOUS) {
      return <div>You cannot update anonymous delegations</div>
    }

    return (
      <ExampleForm
        isLoading={loading}
        onSubmit={handleUpdateGlobalDelegation}
      />
    )
  }
  return (
    <SectionTemplate
      id="updateDelegation"
      title={"2. Update delegation"}
      method="nfid.updateGlobalDelegation()"
      subtitle={
        "To use global delegations, you need provide at least one target canisterID"
      }
      codeSnippet={CODE_SNIPPET}
      jsonResponse={response ? JSON.stringify(response, null, 2) : "{}"}
      example={<Example />}
    />
  )
}
