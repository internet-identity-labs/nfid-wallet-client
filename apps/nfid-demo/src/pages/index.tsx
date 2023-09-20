import React from "react"
import { Route } from "wouter"

import { NFIDLogo } from "@nfid-frontend/ui"

import { AuthenticationForm } from "../components/authentication"
import { DemoCanisterCall } from "../components/canister-call"
import UserNavigation from "./new/header/user-navigation"
import { RequestFungibleTransfer } from "./new/request-transfer/request-fungible"
import { SectionTemplate } from "./new/section"
import SideNav, { Section } from "./new/sidebar"

export const RoutePathHome = "/"

const sections: Section[] = [
  { id: "auth", name: "1. Authentication" },
  { id: "updateDelegation", name: "2. Update delegation" },
  {
    id: "requestTransfer",
    name: "3. Request transfer",
    subPoints: [
      { id: "requestTransfer_sub1", name: "3.1 Fungible request" },
      { id: "requestTransfer_sub2", name: "3.2 NFT request" },
    ],
  },
  { id: "requestCall", name: "4. Request canister call" },
  // ... other sections
]

export const RouteHome: React.FC = () => {
  const [activeSection, setActiveSection] = React.useState<string>("auth")
  const [activeSubPoint, setActiveSubPoint] = React.useState<string>(
    "requestTransfer_sub1",
  )

  return (
    <Route path={RoutePathHome}>
      <main className="relative font-inter">
        <div className="grid grid-cols-[260px,1fr]">
          <SideNav sections={sections} activeSection={activeSection} />
          <div className="p-5 space-y-5">
            <div className="flex justify-end pb-10">
              <UserNavigation isAuthenticated={true} />
            </div>
            <SectionTemplate
              title={"1. Authentication / Registration"}
              method="nfid.getDelegation()"
              subtitle={
                "To use global delegations, you need provide at least one target canisterID"
              }
              codeSnippet={`const { data: nfid } = useSWRImmutable("nfid", () =>
    NFID.init({ origin: NFID_PROVIDER_URL }),
  )`}
              jsonResponse={`{
    "error": "User canceled request"
}`}
              example={<AuthenticationForm />}
            />
            <hr />
            <SectionTemplate
              title={"2. Update delegation"}
              method="nfid.renewDelegation()"
              subtitle={
                "To use global delegations, you need provide at least one target canisterID"
              }
              codeSnippet={`const { data: nfid } = useSWRImmutable("nfid", () =>
    NFID.init({ origin: NFID_PROVIDER_URL }),
  )`}
              jsonResponse={`{
    "error": "User canceled request"
}`}
              example={<AuthenticationForm />}
            />
            <hr />

            <SectionTemplate
              title={"3. Request transfer"}
              method="nfid.requestTransferFT()"
              subtitle={
                "To use global delegations, you need provide at least one target canisterID"
              }
              codeSnippet={`const onRequestTransfer = useCallback(
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
)`}
              jsonResponse={`{
    "error": "User canceled request"
}`}
              example={<RequestFungibleTransfer />}
            />
            <hr />

            <SectionTemplate
              title={"4. Request canister call"}
              method="nfid.requestTransferNFT()"
              subtitle={
                "To use global delegations, you need provide at least one target canisterID"
              }
              codeSnippet={`const handleExecuteCanisterCall = async (values: any) => {
  if (!nfid) return alert("NFID is not initialized")

  const response = await nfid
    .requestCanisterCall({
      method: values.method,
      canisterId: values.canisterId,
      parameters: values.parameters.length ? values.parameters : "",
    })
    .catch((e: Error) => ({ error: e.message }))

  setResponse(response)
}`}
              jsonResponse={`{
    "error": "User canceled request"
}`}
              example={<DemoCanisterCall />}
            />
          </div>
        </div>
      </main>
    </Route>
  )
}
