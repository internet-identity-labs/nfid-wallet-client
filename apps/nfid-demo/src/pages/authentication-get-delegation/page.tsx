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

declare const NFID_PROVIDER_URL: string

export const PageAuthenticationGetDelegation = () => {
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
  console.debug("PageAuthenticationGetDelegation", { targetCanisterIds })

  React.useEffect(() => {
    if (nfid?.isAuthenticated) {
      const identity = nfid.getIdentity()
      updateAuthButton({ label: "Logout" })
      setNfidResponse({ principal: identity.getPrincipal().toText() })
    }
  }, [nfid, updateAuthButton])

  const [nfidResponse, setNfidResponse] = useState({})

  const handleAuthenticate = useCallback(async () => {
    if (!nfid) throw new Error("NFID not initialized")

    console.debug("handleAuthenticate")
    updateAuthButton({ loading: true, label: "Authenticating..." })
    const identity = await nfid.getDelegation(
      targetCanisterIds.length ? { targets: targetCanisterIds } : undefined,
    )
    updateAuthButton({ loading: false, label: "Logout" })
    setNfidResponse({ principal: identity.getPrincipal().toText() })
  }, [nfid, targetCanisterIds, updateAuthButton])

  const handleRenewDelegation = useCallback(async () => {
    if (!nfid) throw new Error("NFID not initialized")

    console.debug("handleRenewDelegation")
    updateRenewDelegationButton({
      loading: true,
      label: "Refetching Delegation...",
    })
    const identity = await nfid.renewDelegation({ targets: targetCanisterIds })
    console.debug("handleRenewDelegation", { identity })
    updateRenewDelegationButton({ loading: false, label: "Renew Delegation" })
    setNfidResponse({ principal: identity.getPrincipal().toText() })
  }, [nfid, targetCanisterIds, updateRenewDelegationButton])

  const handleLogout = useCallback(async () => {
    if (!nfid) throw new Error("NFID not initialized")

    await nfid.logout()
    setNfidResponse({})
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
              onClick={() =>
                append({
                  canisterId: fields.length
                    ? ""
                    : "txkre-oyaaa-aaaap-qa3za-cai",
                })
              }
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
      <div
        className={clsx(
          "w-full border border-gray-200 rounded-xl",
          "px-5 py-4 mt-8",
          "sm:px-[30px] sm:py-[26px]",
        )}
      >
        <h2 className={clsx("font-bold mb-1")}>NFID Response:</h2>
        <pre>{JSON.stringify(nfidResponse, null, 2)}</pre>
      </div>
    </PageTemplate>
  )
}
