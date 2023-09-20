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

import { DemoCanisterCall } from "../../components/canister-call"
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
      // FIXME: make dynamic
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
      if (!receiver.length) return alert("Receiver should not be empty")
      if (!values.amount.length) return alert("Please enter an amount")

      const res = await nfid
        ?.requestTransferFT({
          receiver,
          amount: String(Number(values.amount) * E8S),
        })
        .catch((e: Error) => ({ error: e.message }))
      setTransferResponse(res)
      refetchBalance()
    },
    [nfid, receiver, refetchBalance],
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

      if (!selectedNFTIds[0].length) return alert("Please select NFT")

      const res = await nfid
        ?.requestTransferNFT({
          receiver,
          tokenId: selectedNFTIds[0],
        })
        .catch((e: Error) => ({ error: e.message }))
      setTransferNFTResponse(res)
      refetchNFTs()
    },
    [nfid, receiver, refetchNFTs, selectedNFTIds],
  )

  return (
    <div
      title={"Request transfer"}
      className="flex flex-col w-full min-h-screen !p-0 divide-y"
    >
      <div className="p-5  h-[500px]">
        {/* Step 1: Authentication */}
        <div className="flex flex-col w-64 my-8">
          <Button
            id="loginButton"
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
            <code id="authLogs">
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
              id="inputICAddressFT"
              labelText="Receiver IC address"
              placeholder="39206df1ca32d2..."
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
            />
            <Input
              id="inputAmount"
              labelText="Amount ICP"
              placeholder="0.0001"
              errorText={errors.amount?.message}
              {...register("amount")}
            />
            <Button
              id="buttonRequestICP"
              onClick={handleSubmit(onRequestTransfer)}
            >
              Request ICP transfer
            </Button>
          </div>
          <div className="w-full p-6 mt-6 bg-gray-900 rounded-lg shadow-md">
            <h3 className="mb-4 text-xl text-white">Transfer logs</h3>
            <pre className="p-4 overflow-x-auto text-sm text-white bg-gray-800 rounded">
              <code id="requestICPLogs">
                {JSON.stringify(transferResponse, null, 4)}
              </code>
            </pre>
          </div>
        </div>
        <div className="flex flex-col p-5">
          <H4 className="mb-10">Request NFT transfer</H4>
          {/* Step 2: Request IC NFT transfer */}
          <div className="flex flex-col space-y-4">
            <Input
              id="inputICAddressNFT"
              labelText="Receiver IC address"
              placeholder="39206df1ca32d2..."
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
            />
            <DropdownSelect
              id="inputNFT"
              label="NFT"
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
            <Button
              id="buttonRequestNFT"
              onClick={handleSubmit(onRequestNFTTransfer)}
            >
              Request NFT transfer
            </Button>
          </div>
          <div className="w-full p-6 mt-6 bg-gray-900 rounded-lg shadow-md">
            <h3 className="mb-4 text-xl text-white">Transfer logs</h3>
            <pre className="p-4 overflow-x-auto text-sm text-white bg-gray-800 rounded">
              <code id="requestNFTLogs">
                {JSON.stringify(transferNFTResponse, null, 4)}
              </code>
            </pre>
          </div>
        </div>
      </div>

      <DemoCanisterCall nfid={nfid} identity={delegation} />
    </div>
  )
}
