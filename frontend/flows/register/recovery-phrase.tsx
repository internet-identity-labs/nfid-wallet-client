import {
  Button,
  Card,
  CardAction,
  CardBody,
  CardTitle,
  P,
} from "frontend/ui-kit/src/index"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import React, { useState } from "react"
import { HiCheck, HiClipboard } from "react-icons/hi"
import { Link, useLocation } from "react-router-dom"
import { useStartUrl } from "frontend/hooks/use-start-url"

interface LocationState {
  recoveryPhrase: string
}

interface IdentityPersonaCreatekeysCompleteScreenProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const RegisterRecoveryPhraseScreen: React.FC<
  IdentityPersonaCreatekeysCompleteScreenProps
> = ({ className }) => {
  const { state } = useLocation()
  const startUrl = useStartUrl()

  const { recoveryPhrase } = state as LocationState

  const [copied, setCopied] = useState(false)
  return (
    <AppScreen isFocused>
      <Card className={clsx("h-full flex flex-col sm:block", className)}>
        <CardTitle>Welcome! You're all set</CardTitle>
        <CardBody className="flex flex-col items-center max-w-lg">
          <div className="p-4 bg-gray-200 rounded">
            <div className="mb-5 font-bold text-center text-indigo-600 uppercase">
              You need to save this!
            </div>
            <P>{recoveryPhrase}</P>

            <Button
              className={clsx(
                "flex items-center float-right my-2",
                copied
                  ? "border-indigo-700 text-indigo-700"
                  : "border-indigo-500 text-indigo-500",
              )}
              onClick={() => setCopied(true)}
            >
              {copied ? (
                <HiCheck className="mr-2 text-lg" />
              ) : (
                <HiClipboard className="mr-2 text-lg" />
              )}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </CardBody>
        <CardAction bottom className="justify-center">
          {startUrl && copied ? (
            <Link to={startUrl}>
              <Button block large secondary>
                Log in to DSCVR
              </Button>
            </Link>
          ) : (
            <Button block large secondary disabled>
              Log in to DSCVR
            </Button>
          )}
        </CardAction>
      </Card>
    </AppScreen>
  )
}
