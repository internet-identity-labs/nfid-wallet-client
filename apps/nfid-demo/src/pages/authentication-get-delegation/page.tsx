import { Identity } from "@dfinity/agent"
import clsx from "clsx"
import { useCallback, useState } from "react"
import React from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { ImSpinner } from "react-icons/im"
import useSWRImmutable from "swr/immutable"

import { Button, H1, Input } from "@nfid-frontend/ui"
import { NFID } from "@nfid/embed"

import { useButtonState } from "../../hooks/useButtonState"
import { PageTemplate } from "../page-template"
import { PrincipalIdFromIdentity } from "./components/principal-from-identity"

declare const NFID_PROVIDER_URL: string

const canisterIds = [
  // "txkre-oyaaa-aaaap-qa3za-cai",
  "irshc-3aaaa-aaaam-absla-cai",
]

export const PageAuthenticationGetDelegation = () => {
  const [identity, setIdentity] = useState<Identity>()
  const [response, setResponse] = useState({})
  const [error, setError] = useState<string>()
  const [authButton, updateAuthButton] = useButtonState({
    label: "Authenticate",
  })
  const [renewDelegationButton, updateRenewDelegationButton] = useButtonState({
    label: "Renew Delegation",
  })
  const { data: nfid } = useSWRImmutable("nfid", () =>
    NFID.init({ origin: NFID_PROVIDER_URL }),
  )
  const { control, register } = useForm<{
    items: { canisterId: string; id?: string }[]
  }>()
  const { fields, append, remove } = useFieldArray({
    rules: { minLength: 4 },
    control,
    name: "items", // This should match the name of your array field
  })

  const targetCanisterIds = React.useMemo(
    () => fields.map((field) => field.canisterId),
    [fields],
  )
  console.debug("PageAuthenticationGetDelegation", {
    targetCanisterIds,
    error,
    response,
  })

  React.useEffect(() => {
    if (nfid?.isAuthenticated) {
      const identity = nfid.getIdentity()
      updateAuthButton({ label: "Logout" })
      setResponse({ principal: identity.getPrincipal().toText() })
      setIdentity(identity as unknown as Identity)
    }
  }, [nfid, updateAuthButton])

  const handleAuthenticate = useCallback(async () => {
    setError(undefined)
    if (!nfid) throw new Error("NFID not initialized")

    console.debug("handleAuthenticate", { targetCanisterIds })
    updateAuthButton({ loading: true, label: "Authenticating..." })
    try {
      const identity = await nfid.getDelegation(
        targetCanisterIds.length ? { targets: targetCanisterIds } : undefined,
      )
      setIdentity(identity as unknown as Identity)
      updateAuthButton({ loading: false, label: "Logout" })
      setResponse({ principal: identity.getPrincipal().toText() })
    } catch (error: any) {
      console.debug("handleAuthenticate", { error })
      updateAuthButton({ loading: false, label: "Authenticate" })
      setError(error)
    }
  }, [nfid, targetCanisterIds, updateAuthButton])

  const handleRenewDelegation = useCallback(async () => {
    setError(undefined)
    if (!nfid) throw new Error("NFID not initialized")

    console.debug("handleRenewDelegation")
    updateRenewDelegationButton({
      loading: true,
      label: "Refetching Delegation...",
    })
    try {
      const identity = await nfid.renewDelegation({
        targets: targetCanisterIds,
      })
      console.debug("handleRenewDelegation", { identity })
      setIdentity(identity as unknown as Identity)
      setResponse({ principal: identity.getPrincipal().toText() })
    } catch (error: any) {
      console.debug("handleRenewDelegation", { error })
      setError(error.message)
    }
    updateRenewDelegationButton({ loading: false, label: "Renew Delegation" })
  }, [nfid, targetCanisterIds, updateRenewDelegationButton])

  const handleLogout = useCallback(async () => {
    setError(undefined)
    if (!nfid) throw new Error("NFID not initialized")

    await nfid.logout()
    setResponse({})
    setIdentity(undefined)
    updateAuthButton({
      disabled: false,
      loading: false,
      label: "Authenticate",
    })
  }, [nfid, updateAuthButton])

  return (
    <PageTemplate title="Authentication / Registration">
      <H1 className="title">Authentication / Registration</H1>
      <div>
        by using <strong>@nfid/embed</strong>
      </div>

      <div
        className={clsx(
          "flex flex-col gap-4",
          "w-full border border-gray-200 rounded-xl",
          "px-5 py-4 mt-8",
          "sm:px-[30px] sm:py-[26px]",
        )}
      >
        <div>
          To use global delegations, you need provide at least one target
          cansiterId
        </div>
        <div className="flex flex-col gap-2" onSubmit={() => {}}>
          {/* <form onSubmit={handleSubmit(onSubmit)}> */}
          {fields.map((field, index) => {
            console.debug("form", { field, index })
            return (
              <div key={field.id} className="flex gap-2 center">
                <Input
                  labelText={`target canisterId ${index + 1}`}
                  {...register(`items.${index}.canisterId`)} // Use index to name the input fields
                  // defaultValue={field.name} // Use defaultValue for pre-filling fields
                  placeholder={`add canisterId ${index + 1}`}
                  className="flex-1"
                />
                <div className="flex flex-end">
                  <Button type="stroke" isSmall onClick={() => remove(index)}>
                    delete
                  </Button>
                </div>
              </div>
            )
          })}
          <div className="flex gap-2">
            <Button
              type="stroke"
              isSmall
              onClick={() => {
                if (fields.length < 1) {
                  canisterIds.forEach((canisterId) => {
                    append({ canisterId })
                  })
                }
              }}
            >
              Add target canisterId
            </Button>
            {nfid?.isAuthenticated && targetCanisterIds.length ? (
              <Button
                disabled={renewDelegationButton.disabled}
                onClick={handleRenewDelegation}
              >
                {renewDelegationButton.loading ? (
                  <div className={clsx("flex items-center space-x-2")}>
                    <ImSpinner className={clsx("animate-spin")} />
                    <div>{renewDelegationButton.label}</div>
                  </div>
                ) : (
                  renewDelegationButton.label
                )}
              </Button>
            ) : null}
            <Button
              disabled={authButton.disabled}
              onClick={
                nfid?.isAuthenticated ? handleLogout : handleAuthenticate
              }
            >
              {authButton.loading ? (
                <div className={clsx("flex items-center space-x-2")}>
                  <ImSpinner className={clsx("animate-spin")} />
                  <div>{authButton.label}</div>
                </div>
              ) : (
                authButton.label
              )}
            </Button>
          </div>
        </div>
      </div>
      {!error ? (
        <PrincipalIdFromIdentity
          canisterId={"irshc-3aaaa-aaaam-absla-cai"}
          identity={identity}
        />
      ) : (
        <div
          className={clsx(
            "w-full border border-gray-200 rounded-xl",
            "px-5 py-4 mt-8",
            "sm:px-[30px] sm:py-[26px]",
          )}
        >
          <h2 className={clsx("font-bold mb-1")}>NFID Error:</h2>
          <pre>{error}</pre>
        </div>
      )}
    </PageTemplate>
  )
}
