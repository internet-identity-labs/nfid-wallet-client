import clsx from "clsx"
import React from "react"
import { ImSpinner } from "react-icons/im"

import { Button, Input } from "@nfid-frontend/ui"

import { useAuthentication } from "../hooks/useAuthentication"

const canisterIds = [
  // "txkre-oyaaa-aaaap-qa3za-cai",
  "irshc-3aaaa-aaaam-absla-cai",
]

export const AuthenticationForm = () => {
  const {
    setError,
    nfid,
    fields,
    register,
    append,
    remove,
    setIdentity,
    updateAuthButton,
    targetCanisterIds,
    renewDelegationButton,
    handleRenewDelegation,
    authButton,
    handleAuthenticate,
  } = useAuthentication()

  const handleLogout = React.useCallback(async () => {
    setError(undefined)
    if (!nfid) throw new Error("NFID not initialized")

    await nfid.logout()
    setIdentity(undefined)
    updateAuthButton({
      disabled: false,
      loading: false,
      label: "Authenticate",
    })
  }, [nfid, setError, setIdentity, updateAuthButton])

  return (
    <div className={clsx("flex flex-col gap-4")}>
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
            onClick={nfid?.isAuthenticated ? handleLogout : handleAuthenticate}
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
  )
}
