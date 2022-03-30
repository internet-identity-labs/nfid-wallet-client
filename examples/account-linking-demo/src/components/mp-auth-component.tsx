// eslint-disable-next-line no-unused-vars
import { Principal } from "@dfinity/principal"
import { useInternetIdentity } from "@identity-labs/react-ic-ii-auth"
import { Loader } from "@identity-labs/ui"
import clsx from "clsx"
import React from "react"
import { useProfile } from "src/ic-utils/profile"
import { Button } from "src/ui-lib/atoms/button"
import { AccountLinkingDemo } from "./account-linking"

export const MPAuthComponent = () => {
  const [isLoading, setIsLoading] = React.useState(false)
  const [iam, setIam] = React.useState("")
  const { identity, isAuthenticated, signout, authenticate } =
    useInternetIdentity()

  const { whoami } = useProfile({ identity })

  const handleWhoami = React.useCallback(async () => {
    setIsLoading(true)
    const response = await whoami()
    setIam((response as Principal).toString())
    setIsLoading(false)
  }, [whoami])

  return !isAuthenticated ? (
    <Button onClick={authenticate}>Login with NFID</Button>
  ) : (
    <div className={clsx("flex flex-col")}>
      <div className={clsx("flex flex-col")}>
        <h2 className={clsx("font-bold text-lg uppercase mb-4")}>
          Delegate: Multipass
        </h2>
        <div className="flex flex-col space-y-4">
          {iam ? (
            <>
              <div className={clsx("font-bold mb-2")}>Your identity is:</div>
              <div className={clsx("mb-6")}>{iam}</div>
            </>
          ) : (
            <Button onClick={handleWhoami}>
              <span>whoami</span>
            </Button>
          )}
          <AccountLinkingDemo />
          <Button onClick={signout}>signout</Button>
          <Button onClick={() => setIam("")}>clear</Button>
        </div>

        <Loader isLoading={isLoading} />
      </div>
    </div>
  )
}
