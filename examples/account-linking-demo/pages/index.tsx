import React from "react"
import { NavBar } from "src/components/header"
import { PageWrapper } from "src/components/page-wrapper"
import { RegiserIIAccount } from "src/components/register-ii-account"
import { RegisterNFIDAccount } from "src/components/register-nfid-account"
import { useAccountLinkingStepper } from "src/use-account-linking-stepper"

function App() {
  const { state, setProvider, setIIPrincipalId, setNFIDPrincipalId } =
    useAccountLinkingStepper()

  console.log(">> ", {
    iiPrincipalId: state.ii.principalId,
    usedProvide: state.usedProvider,
  })

  return (
    <PageWrapper>
      <NavBar>NFID Account linking demo</NavBar>
      <RegiserIIAccount
        onUseProvider={(identity) => {
          setProvider("II")
          setIIPrincipalId(identity.getPrincipal().toString())
        }}
      />
      <RegisterNFIDAccount
        onUseProvider={(identity) => {
          setProvider("NFID")
          setNFIDPrincipalId(identity.getPrincipal().toString())
        }}
      />
    </PageWrapper>
  )
}

export default App
