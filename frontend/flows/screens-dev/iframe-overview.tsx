import clsx from "clsx"
import { IFrameWrapper } from "components/molecules/iframe/wrapper"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import {
  Button,
  Card,
  CardBody,
  DropdownMenu,
  H5,
  Label,
  MenuItem,
} from "frontend/ui-kit/src"
import React from "react"
import { AuthorizeRegisterDeciderContent } from "../screens-app/authenticate/login-unknown/register-decider/content"
import { RestoreAccessPointRecoveryPhraseContent } from "../screens-app/restore-access-point/recovery-phrase/content"
import { IFrameAuthenticateNFIDLogin } from "../screens-iframe/authenticate/login"
import { IFrameNFIDPersonalize } from "../screens-iframe/personalize"

interface IFrameOverviewProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IFrameOverview: React.FC<IFrameOverviewProps> = ({
  children,
  className,
}) => {
  const applicationName = "NFID Demo"
  const accountName = "John Doe"
  const personas = ["John Doe", "John77", "john_doe"]
  const anchors = ["10001", "10002", "10003"]

  const [selectedItem, setSelectedItem] = React.useState(personas[0])

  return (
    <AppScreen className={clsx("", className)}>
      <Card>
        <CardBody>
          <div className="grid grid-cols-12 gap-x-4 gap-y-12 grid-flow-row">
            {/* IFrameNFIDLogin */}
            <IFrameWrapper
              className="inset-0 col-span-12 md:col-span-6 xl:col-span-4 relative"
              fixedHeight={false}
            >
              <IFrameAuthenticateNFIDLogin />
            </IFrameWrapper>

            {/* IFrameAuthorizeApp */}
            <IFrameWrapper
              className="inset-0 col-span-12 md:col-span-6 xl:col-span-4 relative"
              fixedHeight={false}
            >
              <IFrameScreen logo>
                <H5 className="mb-4">Log in to {applicationName}</H5>

                <div className="mb-5">
                  <Label>Continue as</Label>
                  <DropdownMenu title={`Continue as ${selectedItem}`}>
                    {(toggle) => (
                      <>
                        <Label menuItem>Personas</Label>
                        {personas.map((persona) => (
                          <MenuItem
                            key={persona}
                            title={persona}
                            onClick={() => {
                              setSelectedItem(persona)
                              toggle()
                            }}
                          />
                        ))}

                        <Label menuItem>Anchors</Label>
                        {anchors.map((anchor) => (
                          <MenuItem
                            key={anchor}
                            title={anchor}
                            onClick={() => {
                              setSelectedItem(anchor)
                              toggle()
                            }}
                          />
                        ))}
                      </>
                    )}
                  </DropdownMenu>
                </div>

                <Button secondary block>
                  Log in
                </Button>
                <Button text block>
                  Create a new persona
                </Button>
              </IFrameScreen>
            </IFrameWrapper>

            {/* IFrameAuthorizeRegisterDecider */}
            <IFrameWrapper
              className="relative inset-0 col-span-12 md:col-span-6 xl:col-span-4"
              fixedHeight={false}
            >
              <IFrameScreen logo>
                <AuthorizeRegisterDeciderContent
                  iframe
                  onRegister={() => {
                    console.log("Register")
                  }}
                  onLogin={() => {
                    console.log("Login")
                  }}
                />
              </IFrameScreen>
            </IFrameWrapper>

            {/* IFrameNFIDPersonalize */}
            <IFrameWrapper
              className="relative inset-0 col-span-12 md:col-span-6 xl:col-span-4"
              fixedHeight={false}
            >
              <IFrameNFIDPersonalize />
            </IFrameWrapper>

            {/* IFrameRestoreAccessPoint */}
            <IFrameWrapper
              className="relative inset-0 col-span-12 md:col-span-6 xl:col-span-4"
              fixedHeight={false}
            >
              <IFrameScreen logo>
                <RestoreAccessPointRecoveryPhraseContent iframe />
              </IFrameScreen>
            </IFrameWrapper>
          </div>
        </CardBody>
      </Card>
    </AppScreen>
  )
}
