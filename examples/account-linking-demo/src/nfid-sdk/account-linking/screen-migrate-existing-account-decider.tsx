import React from "react"
import clsx from "clsx"
import {
  RadioButton,
  Button,
  H5,
  NFIDGradientBar,
  Logo,
} from "@identity-labs/ui"

interface ExternalScreenMigrateExistingAccountDeciderProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  onLinkAccount: () => void
  onNewUser: () => void
}

export const ExternalScreenMigrateExistingAccountDecider: React.FC<
  ExternalScreenMigrateExistingAccountDeciderProps
> = ({ children, className, onLinkAccount, onNewUser }) => {
  const [linkAccount, setLinkAccount] = React.useState(
    "rb_link_account_register",
  )
  const handleClick = () => {
    if (linkAccount === "rb_link_account_register") {
      onLinkAccount()
    }

    if (linkAccount === "rb_link_account_login") {
      onNewUser()
    }
  }
  return (
    <div className="relative min-h-[510px]">
      <NFIDGradientBar />

      <Logo className="px-5 pt-6" />

      <div className={clsx("p-5")}>
        <H5 className="mb-4">Link existing account</H5>

        <div>
          If you have an existing account with NFID-Demo through an Internet
          Identity anchor, you may link it now to use NFID login instead of
          Internet Identity's.
        </div>

        <div className="py-5">
          <RadioButton
            checked={linkAccount === "rb_link_account_register"}
            name={"rb_link_account_register"}
            text={"Link existing account"}
            value={"rb_link_account_register"}
            onChange={() => setLinkAccount("rb_link_account_register")}
          />
          <RadioButton
            checked={linkAccount === "rb_link_account_login"}
            name={"rb_link_account_login"}
            text={"No thanks, I'm new"}
            value={"rb_link_account_login"}
            onChange={() => setLinkAccount("rb_link_account_login")}
          />
        </div>

        <div className="mt-6">
          <Button secondary block onClick={handleClick}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
