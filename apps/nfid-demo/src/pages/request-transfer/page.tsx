import { DelegationIdentity } from "@dfinity/identity"
import clsx from "clsx"
import { principalToAddress } from "ictool"
import React, { useCallback, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { ImSpinner } from "react-icons/im"
import useSWRImmutable from "swr/immutable"

import { Button, DropdownSelect, H4, Input } from "@nfid-frontend/ui"
import { NFID } from "@nfid/embed"
import { getBalance } from "@nfid/integration"
import { E8S } from "@nfid/integration/token/icp"

import { useButtonState } from "../../hooks/useButtonState"
import { PageTemplate } from "../page-template"

const API = "https://us-central1-entrepot-api.cloudfunctions.net/api"

declare const NFID_PROVIDER_URL: string

export const PageRequestTransfer: React.FC = () => {
  const [receiver, setReceiver] = useState("")
  const [selectedNFTIds, setSelectedNFTIds] = useState<string[]>([""])
  const [delegation, setDelegation] = useState<DelegationIdentity | undefined>()
  const [transferResponse, setTransferResponse] = useState<any>({})
  const [transferNFTResponse, setTransferNFTResponse] = useState<any>({})
  const [canisterCallResponse, setCanisterCallResponse] = useState<
    any | undefined
  >({})
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
    const identity = await nfid.getDelegation({
      targets: ["txkre-oyaaa-aaaap-qa3za-cai"],
    })
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
      amount: "",
    },
  })

  const onRequestTransfer = useCallback(
    async (values: any) => {
      if (!delegation) return
      if (!receiver.length) return alert("Receiver should not be empty")
      if (!values.amount.length) return alert("Please enter an amount")

      const res = await nfid?.requestTransferFT({
        receiver,
        amount: String(Number(values.amount) * E8S),
        sourceAddress: delegation.getPrincipal().toString(),
      })

      setTransferResponse(res)
      refetchBalance()
    },
    [delegation, nfid, receiver, refetchBalance],
  )

  const { data: userNFTs, mutate: refetchNFTs } = useSWRImmutable(
    delegation ? [delegation.getPrincipal(), "nfts"] : null,
    async ([principal]) => {
      return await fetch(`${API}/maddies/getAllNfts/${address}`).then((r) =>
        r.json(),
      )
    },
  )

  const onRequestNFTTransfer = useCallback(
    async (values: any) => {
      if (!receiver.length) return alert("Receiver should not be empty")
      if (!delegation) return
      if (!selectedNFTIds[0].length) return alert("Please select NFT")

      const res = await nfid?.requestTransferNFT({
        receiver,
        tokenId: selectedNFTIds[0],
        sourceAddress: delegation.getPrincipal().toString(),
      })

      setTransferNFTResponse(res)
      refetchNFTs()
    },
    [delegation, nfid, receiver, refetchNFTs, selectedNFTIds],
  )

  return (
    <PageTemplate
      title={"Request transfer"}
      className="flex flex-col w-full min-h-screen !p-0 divide-y"
    >
      <div className="p-5  h-[500px]">
        <H4 className="mb-10">1. Authentication</H4>
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

      <div className="grid grid-cols-2 divide-x">
        <div className="flex flex-col p-5">
          <H4 className="mb-10">Request ICP transfer</H4>
          {/* Step 2: Request ICP transfer */}
          <div className="flex flex-col space-y-4">
            <Input
              labelText="Receiver IC address"
              placeholder="39206df1ca32d2..."
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
            />
            <Input
              labelText="Amount ICP"
              placeholder="0.0001"
              errorText={errors.amount?.message}
              {...register("amount")}
            />
            <Button onClick={handleSubmit(onRequestTransfer)}>
              Request ICP transfer
            </Button>
          </div>
          <div className="w-full p-6 mt-6 bg-gray-900 rounded-lg shadow-md">
            <h3 className="mb-4 text-xl text-white">Transfer logs</h3>
            <pre className="p-4 overflow-x-auto text-sm text-white bg-gray-800 rounded">
              <code>{JSON.stringify(transferResponse, null, 4)}</code>
            </pre>
          </div>
        </div>
        <div className="flex flex-col p-5">
          <H4 className="mb-10">Request NFT transfer</H4>
          {/* Step 2: Request IC NFT transfer */}
          <div className="flex flex-col space-y-4">
            <Input
              labelText="Receiver IC address"
              placeholder="39206df1ca32d2..."
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
            />
            <DropdownSelect
              options={
                userNFTs?.map((nft: any) => ({
                  label: nft.tokenId,
                  icon: nft?.imageUrl,
                  value: nft?.tokenId,
                })) ?? []
              }
              selectedValues={selectedNFTIds}
              setSelectedValues={setSelectedNFTIds}
              isMultiselect={false}
            />
            <Button onClick={handleSubmit(onRequestNFTTransfer)}>
              Request NFT transfer
            </Button>
          </div>
          <div className="w-full p-6 mt-6 bg-gray-900 rounded-lg shadow-md">
            <h3 className="mb-4 text-xl text-white">Transfer logs</h3>
            <pre className="p-4 overflow-x-auto text-sm text-white bg-gray-800 rounded">
              <code>{JSON.stringify(transferNFTResponse, null, 4)}</code>
            </pre>
          </div>
        </div>
      </div>

      <div className="p-5">
        <H4>Request canister call</H4>
        <Input
          labelText="Canister ID"
          placeholder="74gpt-tiaaa-aaaak-aacaa-cai"
        />
        <Input labelText="Method name" placeholder="ii_getPrincipal" />
        <Input labelText="Arguments" />

        <Button className="mt-2">Call the canister</Button>

        <div className="w-full p-6 mt-4 bg-gray-900 rounded-lg shadow-md">
          <h3 className="mb-4 text-xl text-white">Logs</h3>
          <pre className="p-4 overflow-x-auto text-sm text-white bg-gray-800 rounded">
            <code>{JSON.stringify(canisterCallResponse, null, 4)}</code>
          </pre>
        </div>
      </div>
    </PageTemplate>
  )
}
