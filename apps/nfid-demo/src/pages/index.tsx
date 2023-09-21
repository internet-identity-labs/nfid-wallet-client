import React, { useEffect } from "react"
import { Route } from "wouter"

import { Authentication } from "./new/examples/authentication"
import { RequestCanisterCall } from "./new/examples/request-canister-call"
import { RequestFungibleTransfer } from "./new/examples/request-transfer/request-fungible"
import { RequestNonFungibleTransfer } from "./new/examples/request-transfer/request-non-fungible"
import { UpdateDelegation } from "./new/examples/updated-delegation"
import UserNavigation from "./new/header/user-navigation"
import SideNav, { Section } from "./new/sidebar"

export const RoutePathHome = "/"

const sections: Section[] = [
  { id: "authentication", name: "1. Authentication" },
  { id: "updateDelegation", name: "2. Update delegation" },
  {
    id: "requestICPTransfer",
    name: "3. Request Fungible Token transfer",
  },
  {
    id: "requestEXTTransfer",
    name: "4. Request NFT transfer",
  },
  { id: "requestCanisterCall", name: "5. Request canister call" },
]

export const RouteHome: React.FC = () => {
  const [activeSection, setActiveSection] =
    React.useState<string>("authentication")

  useEffect(() => {
    const handleScroll = () => {
      let minDistanceFromTop = Infinity
      let currentId = sections[0].id

      sections.forEach((section) => {
        const element = document.getElementById(section.id)
        if (!element) return

        const rect = element.getBoundingClientRect()

        // Check if the top of the element is within the viewport
        if (rect.top >= 0 && rect.top < minDistanceFromTop) {
          minDistanceFromTop = rect.top
          currentId = section.id
        }
      })

      setActiveSection(currentId)
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <Route path={RoutePathHome}>
      <main className="relative font-inter">
        <div className="grid grid-cols-[260px,1fr]">
          <SideNav sections={sections} activeSection={activeSection} />
          <div className="p-5 pb-16 space-y-5">
            <div className="flex items-center justify-end pb-10">
              <UserNavigation />
            </div>
            <Authentication />
            <hr />
            <UpdateDelegation />
            <hr />
            <RequestFungibleTransfer />
            <hr />
            <RequestNonFungibleTransfer />
            <hr />
            <RequestCanisterCall />
          </div>
        </div>
      </main>
    </Route>
  )
}
