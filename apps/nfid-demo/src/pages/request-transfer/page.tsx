import { DelegationIdentity } from "@dfinity/identity"
import clsx from "clsx"
import { principalToAddress } from "ictool"
import React, { useCallback, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { ImSpinner } from "react-icons/im"
import useSWRImmutable from "swr/immutable"

import { Button, H4, Input } from "@nfid-frontend/ui"
import { NFID } from "@nfid/embed"
import { getBalance } from "@nfid/integration"
import { E8S } from "@nfid/integration/token/icp"

import { useButtonState } from "../../hooks/useButtonState"
import { PageTemplate } from "../page-template"

declare const NFID_PROVIDER_URL: string

export const PageRequestTransfer: React.FC = () => {
  const [delegation, setDelegation] = useState<DelegationIdentity | undefined>()
  const [transferResponse, setTransferResponse] = useState<any>({})
  const [authButton, updateAuthButton] = useButtonState({
    label: "Authenticate",
  })

  const { data: balance, mutate: refetchBalance } = useSWRImmutable(
    delegation ? [delegation.getPrincipal(), "balance"] : null,
    async ([principal]) =>
      Number(await getBalance(principalToAddress(principal))) / E8S,
  )

  const { data: nfid } = useSWRImmutable("nfid", () =>
    NFID.init({ origin: NFID_PROVIDER_URL }),
  )

  React.useEffect(() => {
    if (nfid?.isAuthenticated) {
      const identity = nfid.getIdentity()
      updateAuthButton({ label: "Logout" })
      setDelegation(identity as unknown as DelegationIdentity)
    }
  }, [nfid, updateAuthButton])

  const handleAuthenticate = useCallback(async () => {
    if (!nfid) throw new Error("NFID not initialized")

    console.debug("handleAuthenticate")
    updateAuthButton({ loading: true, label: "Authenticating..." })
    const identity = await nfid.getDelegation()
    updateAuthButton({ loading: false, label: "Authenticated" })
    setDelegation(identity as unknown as DelegationIdentity)
  }, [nfid, updateAuthButton])

  const handleLogout = useCallback(async () => {
    setDelegation(undefined)
    updateAuthButton({
      disabled: false,
      loading: false,
      label: "Authenticate",
    })
  }, [updateAuthButton])

  const address = useMemo(() => {
    return delegation?.getPrincipal()
      ? principalToAddress(delegation?.getPrincipal())
      : ""
  }, [delegation])

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      receiver: "",
      amount: "",
    },
  })

  const onRequestTransfer = useCallback(
    async (values: any) => {
      if (!delegation) return

      const res = await nfid?.requestTransfer({
        receiver: values.receiver,
        amount: String(Number(values.amount) * E8S),
        sourceAddress: delegation.getPrincipal().toString(),
      })

      console.log({ res })
      setTransferResponse(res)
      refetchBalance()
    },
    [delegation, nfid, refetchBalance],
  )

  return (
    <PageTemplate
      title={"Request transfer"}
      className="grid w-full h-screen grid-cols-2 !p-0 divide-x"
    >
      <div className="p-5">
        <H4 className="mb-10">Authentication</H4>
        {/* Step 1: Authentication */}
        <div className="flex flex-col w-64 my-8">
          <Button
            disabled={authButton.disabled}
            onClick={
              authButton.label === "Logout" ? handleLogout : handleAuthenticate
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

        <div className="w-full p-6 mt-4 bg-gray-900 rounded-lg shadow-md">
          <h3 className="mb-4 text-xl text-white">Authentication logs</h3>
          <pre className="p-4 overflow-x-auto text-sm text-white bg-gray-800 rounded">
            <code>
              {`{
  "principal": "${delegation?.getPrincipal().toString() ?? ""}",
  "address": "${address ?? ""}",
  "balance": "${balance ? `${balance} ICP` : ""}"
}`}
            </code>
          </pre>
        </div>
      </div>

      <div className="flex flex-col p-5">
        <H4 className="mb-10">Request transfer</H4>
        {/* Step 2: Request transfer */}
        <div className="flex flex-col space-y-4">
          <Input
            labelText="Receiver IC address"
            placeholder="39206df1ca32d2..."
            errorText={errors.receiver?.message}
            {...register("receiver", { required: "This field is required" })}
          />
          <Input
            labelText="Amount ICP"
            placeholder="0.0001"
            errorText={errors.amount?.message}
            {...register("amount", { required: "This field is required" })}
          />
          <Button onClick={handleSubmit(onRequestTransfer)}>
            Request transfer
          </Button>
        </div>
        <div className="w-full p-6 mt-6 bg-gray-900 rounded-lg shadow-md">
          <h3 className="mb-4 text-xl text-white">Transfer logs</h3>
          <pre className="p-4 overflow-x-auto text-sm text-white bg-gray-800 rounded">
            <code>{JSON.stringify(transferResponse, null, 4)}</code>
          </pre>
        </div>
      </div>
    </PageTemplate>
  )
}
