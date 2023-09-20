import React from "react"
import { Route } from "wouter"

import { NFIDLogo } from "@nfid-frontend/ui"

import UserNavigation from "./new/header/user-navigation"
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
      <main className="font-inter">
        <header className="grid grid-cols-[260px,1fr]">
          <div className="p-5 bg-gray-100">
            <NFIDLogo />
          </div>
          <div className="flex justify-end p-5">
            <UserNavigation isAuthenticated={false} />
          </div>
        </header>
        <div className="grid grid-cols-[260px,1fr] h-screen">
          <SideNav sections={sections} activeSection={activeSection} />
          <div className="p-5">
            <SectionTemplate
              title={"1. Authentication / Registration"}
              subtitle={
                "To use global delegations, you need provide at least one target canisterID"
              }
              codeSnippet={`const { data: nfid } = useSWRImmutable("nfid", () =>
    NFID.init({ origin: NFID_PROVIDER_URL }),
  )`}
              jsonResponse={`{
    "error": "User canceled request"
}`}
              example={<div></div>}
            />
          </div>
        </div>
      </main>
    </Route>
  )
}
