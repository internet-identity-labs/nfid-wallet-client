import { useAuthenticationContext } from "apps/nfid-demo/src/context/authentication"
import toaster from "packages/ui/src/atoms/toast"
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import useSWRImmutable from "swr/immutable"

import { Button, DropdownSelect, Input } from "@nfid-frontend/ui"
import { DelegationType } from "@nfid/embed"

import { ExampleError } from "../../error"
import { ExampleMethod } from "../../method"
import { SectionTemplate } from "../../section"

const API = "https://us-central1-entrepot-api.cloudfunctions.net/api"
const CODE_SNIPPET = `const { data: nfid } = useSWRImmutable("nfid", () =>
  NFID.init({ origin: NFID_PROVIDER_URL }),
)

const onRequestTransfer = useCallback(
  async (values: any) => {
    if (!nfid) return alert("NFID is not initialized")
    if (!values.receiver.length) return alert("Receiver should not be empty")
    if (!selectedNFTIds.length) return alert("Please select an NFT")

    const res = await nfid
        .requestTransferNFT({
          receiver: values.receiver,
          tokenId: selectedNFTIds[0],
        })
        .catch((e: Error) => ({ error: e.message }))

     setResponse(res)
  },
  [nfid, receiver, refetchBalance],
)`

export const RequestNonFungibleTransfer = () => {
  const { nfid, identity, config, derivationOrigin } =
    useAuthenticationContext()
  const [response, setResponse] = useState("{}")
  const [selectedNFTIds, setSelectedNFTIds] = useState<string[]>([""])

  const { data: userNFTs } = useSWRImmutable(
    identity ? [identity.getPrincipal(), "nfts"] : null,
    async ([_principal]) => {
      return await fetch(`${API}/maddies/getAllNfts/${config?.address}`).then(
        (r) => r.json(),
      )
    },
    { refreshInterval: 5000 },
  )

  const onRequestNFTTransfer = useCallback(
    async (values: any) => {
      if (!values.receiver.length) return alert("Receiver should not be empty")
      if (!selectedNFTIds[0].length) return alert("Please select NFT")

      const res = await nfid
        ?.requestTransferNFT({
          receiver: values.receiver,
          tokenId: selectedNFTIds[0],
          derivationOrigin,
        })
        .catch((e: Error) => ({ error: e.message }))

      setResponse(JSON.stringify(res, null, 2))
    },
    [nfid, selectedNFTIds, derivationOrigin],
  )

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      amount: "",
      receiver: "",
    },
  })

  return (
    <SectionTemplate
      id="requestEXTTransfer"
      title={"4. Request NFT transfer"}
      method="nfid.requestTransferNFT()"
      subtitle={
        <>
          If a user is authenticated with their main wallet address, an
          <ExampleMethod>requestTransferNFT</ExampleMethod> method is exposed to
          request approval to transfer an EXT NFT from the user to a designated
          address.
        </>
      }
      codeSnippet={CODE_SNIPPET}
      jsonResponse={response}
      example={
        nfid?.getDelegationType() === DelegationType.ANONYMOUS ? (
          <ExampleError>You cannot update anonymous delegations</ExampleError>
        ) : (
          <div className="space-y-4">
            <Input
              id="inputICAddressNFT"
              labelText="Receiver IC address"
              placeholder="39206df1ca32d2..."
              errorText={errors.receiver?.message}
              {...register("receiver", { required: "This field is required" })}
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
              isSmall
              id="buttonRequestNFT"
              onClick={
                identity
                  ? handleSubmit(onRequestNFTTransfer)
                  : () => toaster.error("Please authenticate first")
              }
            >
              Request NFT transfer
            </Button>
          </div>
        )
      }
    />
  )
}
