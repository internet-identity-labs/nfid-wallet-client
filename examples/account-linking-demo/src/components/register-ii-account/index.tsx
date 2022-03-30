import { Identity } from "@dfinity/agent"
import {
  InternetIdentityProvider,
  useInternetIdentity,
} from "@identity-labs/react-ic-ii-auth"
import { Button } from "@identity-labs/ui"
import React from "react"
import { createProfileActor } from "src/ic-utils/profile"
import { useForm } from "react-hook-form"
import { useAccountLinkingStepper } from "src/use-account-linking-stepper"

interface RegiserIIAccountProps {
  onUseProvider: (principal: Identity) => void
}

export const RegiserIIAccount: React.FC<RegiserIIAccountProps> = ({
  onUseProvider,
}) => {
  return (
    <InternetIdentityProvider
      authClientOptions={{
        maxTimeToLive: BigInt(Date.now() + 7 * 24 * 60 * 60 * 1e9),
        identityProvider: "https://identity.ic0.app/#authorize",
        onSuccess: (principal) => {
          onUseProvider(principal)
        },
        opener: () =>
          window.open(
            "https://identity.ic0.app/#authorize".toString(),
            "idpWindow",
            `toolbar=0,location=0,menubar=0, width=400, height=600, left=${
              window.screen.width / 2 - 200
            }, top=${window.screen.height / 2 - 300}`,
          ),
      }}
    >
      <RegiserIIAccountContent />
    </InternetIdentityProvider>
  )
}

const RegiserIIAccountContent = () => {
  const fetchRef = React.useRef<{ readAccount?: boolean }>({})
  const [loadingAccount, setLoadingAccount] = React.useState(false)
  const { isAuthenticated, identity, authenticate, signout } =
    useInternetIdentity()
  const { state, setIIUserName } = useAccountLinkingStepper()

  console.log(">> RegiserIIAccountContent", {
    isAuthenticated,
    account: state.ii.userName,
  })

  const handleReadAccount = React.useCallback(async () => {
    fetchRef.current = {
      readAccount: true,
    }
    setLoadingAccount(true)
    const { readAccount } = createProfileActor({
      identity: identity ?? undefined,
    })
    const respone = await readAccount()
    if ("data" in respone) {
      setIIUserName(respone.data.userName)
    }
    console.log(">> RegiserIIAccountContent handleReadAccount", { respone })
    setLoadingAccount(false)
  }, [identity, setIIUserName])

  React.useEffect(() => {
    if (isAuthenticated && !fetchRef.current.readAccount) {
      handleReadAccount()
    }
  }, [handleReadAccount, isAuthenticated])
  return (
    <div className="py-4 mx-4">
      <div>1. Register your Internet Identity Account</div>
      {isAuthenticated || state.ii.principalId ? (
        <div>your principal id: {identity?.getPrincipal().toString()}</div>
      ) : (
        <Button onClick={authenticate}>Login with II</Button>
      )}
      <div>2. Regiser your Account</div>
      {loadingAccount ? (
        <div>...loading</div>
      ) : isAuthenticated &&
        fetchRef.current.readAccount &&
        !state.ii.userName ? (
        <div>
          <RegisterAccountForm
            onRegister={({ userName }) => {
              console.log(">> ", { userName })

              const { register } = createProfileActor({
                identity: identity ?? undefined,
              })
              register(userName)
            }}
          />
        </div>
      ) : (
        <div>Registered userName: {state.ii.userName}</div>
      )}
      {isAuthenticated && (
        <div className="flex">
          <Button
            onClick={async () => {
              if (identity) {
                console.log(">> readAccount", {
                  principalId: identity.getPrincipal().toString(),
                })
                const { readAccount } = createProfileActor({
                  identity: identity ?? undefined,
                })
                const response = await readAccount()
                console.log(">> readAccount", { response })
              }
            }}
          >
            readAccount
          </Button>
          <Button onClick={signout}>Log out II</Button>
        </div>
      )}
    </div>
  )
}

interface RegisterAccountFormProps {
  onRegister: ({ userName }: { userName: string }) => void
}

const RegisterAccountForm: React.FC<RegisterAccountFormProps> = ({
  onRegister,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ userName: string }>()
  return (
    <form onSubmit={handleSubmit(onRegister)}>
      <input placeholder="Your Name" {...register("userName")} />
      {errors.userName && <span>This field is required</span>}
      <Button type="submit">Register</Button>
    </form>
  )
}
