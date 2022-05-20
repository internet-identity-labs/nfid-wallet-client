import { Button } from "@internet-identity-labs/nfid-sdk-react"
import { H2, H5 } from "@internet-identity-labs/nfid-sdk-react"
import { DropdownMenu } from "@internet-identity-labs/nfid-sdk-react"
import { Label, Loader, MenuItem } from "@internet-identity-labs/nfid-sdk-react"
import React from "react"

import { NFIDPersona } from "frontend/services/identity-manager/persona/types"
import { ElementProps } from "frontend/types/react"

interface AuthorizeAppProps extends ElementProps<HTMLDivElement> {
  isRemoteAuthorisation?: boolean
  applicationName: string
  accounts: NFIDPersona[]
  onLogin: (personaId: string) => Promise<void>
  onCreateAccount: () => Promise<void>
}

export const AuthorizeApp: React.FC<AuthorizeAppProps> = ({
  isRemoteAuthorisation,
  applicationName,
  accounts,
  onLogin,
  onCreateAccount,
}) => {
  const [status, setStatus] = React.useState<
    "initial" | "loading" | "success" | "error"
  >("initial")

  const hasNFIDPersonas = accounts.length > 0

  const [selectedItem, setSelectedItem] = React.useState<string>()

  React.useEffect(() => {
    if (!selectedItem && accounts.length > 0) {
      setSelectedItem(accounts[0]?.persona_id)
    }
  }, [accounts, selectedItem])

  const handleLogin = React.useCallback(async () => {
    if (selectedItem) {
      setStatus("loading")
      await onLogin(selectedItem)
      setStatus("success")
    }
  }, [selectedItem, onLogin])

  const handleCreatePersonaAndLogin = React.useCallback(async () => {
    setStatus("loading")
    await onCreateAccount()
    setStatus("success")
  }, [onCreateAccount])

  const title = `Log in to ${applicationName}`

  return (
    <div>
      {isRemoteAuthorisation ? (
        <H5 className="mb-4">{title}</H5>
      ) : (
        <H2 className="mb-4">{title}</H2>
      )}

      <div>
        {hasNFIDPersonas && (
          <>
            <Label>Continue as</Label>
            <DropdownMenu title={`${applicationName} account ${selectedItem}`}>
              {(toggle) => (
                <div className="h-40 overflow-y-auto">
                  <Label menuItem>Accounts</Label>
                  {accounts.map((persona, index) => (
                    <MenuItem
                      key={index}
                      title={`${applicationName} account ${persona.persona_id}`}
                      onClick={() => {
                        setSelectedItem(String(persona.persona_id))
                        toggle()
                      }}
                    />
                  ))}
                </div>
              )}
            </DropdownMenu>
            <Button secondary block onClick={handleLogin}>
              Log in
            </Button>
          </>
        )}
      </div>
      <Button
        text={hasNFIDPersonas ? true : false}
        secondary={hasNFIDPersonas ? false : true}
        block
        onClick={handleCreatePersonaAndLogin}
      >
        Create a new account
      </Button>

      {/* Disabled for first version */}
      {/* <LinkIIAnchorHref onClick={handleIILink} /> */}
      <Loader isLoading={status === "loading"} iframe={isRemoteAuthorisation} />
    </div>
  )
}
