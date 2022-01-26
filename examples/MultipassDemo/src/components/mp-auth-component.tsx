// eslint-disable-next-line no-unused-vars
import { Principal } from "@dfinity/principal"
import clsx from "clsx"
import React from "react"
import { useProfile } from "src/ic-utils/profile"
import { Button, LoadingButton } from "src/ui-lib/atoms/button"
import { MultipassAuth } from "src/ui-lib/molecules/multipass-auth"
import { useInternetIdentity } from "@identity-labs/react-ic-ii-auth"

export const MPAuthComponent = () => {
  const [isLoading, setIsLoading] = React.useState(false)
  const [iam, setIam] = React.useState("")
  const { identity, isAuthenticated, signout } = useInternetIdentity()

  const { whoami } = useProfile({ identity })

  const handleWhoami = React.useCallback(async () => {
    setIsLoading(true)
    const response = await whoami()
    setIam((response as Principal).toString())
    setIsLoading(false)
  }, [whoami])

  return !isAuthenticated ? (
    <MultipassAuth />
  ) : (
    <div className={clsx("flex flex-col")}>
      <div className={clsx("flex flex-col")}>
        <h2 className={clsx("font-bold text-lg uppercase mb-4")}>
          Delegate: Multipass
        </h2>
        {iam ? (
          <>
            <div className={clsx("font-bold mb-2")}>your identity is:</div>
            <div className={clsx("mb-6")}>{iam}</div>
          </>
        ) : (
          <LoadingButton
            isLoading={isLoading}
            onClick={handleWhoami}
            className="relative overflow-hidden"
          >
            <span>whoami</span>
          </LoadingButton>
        )}
        <Button className="mt-2" onClick={signout}>
          signout
        </Button>
        <Button className="mt-2" onClick={() => setIam("")}>
          clear
        </Button>
      </div>
    </div>
  )
}
