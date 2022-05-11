import {
  Button,
  Card,
  CardBody,
  DropdownMenu,
  H5,
  IFrameWrapper,
  Label,
  MenuItem,
} from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"

import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { IFrameNFIDPersonalize } from "frontend/flows/screens-iframe/personalize"
import { IFrameNFIDLogin } from "frontend/screens/nfid-login/screen-iframe"
import { RecoverNFID } from "frontend/screens/recover-nfid"
import { RegisterDeviceDecider } from "frontend/screens/register-device-decider"

import { IFrameRecoverNFIDConstants } from "../screens-iframe/restore-access-point/routes"

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
  const personas = ["John Doe", "John77", "john_doe"]
  const anchors = ["10001", "10002", "10003"]

  const [selectedItem, setSelectedItem] = React.useState(personas[0])

  return (
    <AppScreen>
      <main className={clsx(className, "flex flex-1")}>
        <div className="container px-6 py-0 mx-auto sm:py-4">
          <Card>
            <CardBody>
              <div className="grid grid-flow-row grid-cols-12 gap-x-4 gap-y-12">
                {/* IFrameNFIDLogin */}
                <IFrameWrapper
                  className="relative inset-0 col-span-12 md:col-span-6 xl:col-span-4"
                  fixedHeight={false}
                >
                  <IFrameNFIDLogin />
                </IFrameWrapper>

                {/* IFrameAuthorizeApp */}
                <IFrameWrapper
                  className="relative inset-0 col-span-12 md:col-span-6 xl:col-span-4"
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
                    <RegisterDeviceDecider
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
                    <RecoverNFID
                      iframe
                      registerDeviceDeciderPath={`${IFrameRecoverNFIDConstants.base}/${IFrameRecoverNFIDConstants.registerDevice}`}
                    />
                  </IFrameScreen>
                </IFrameWrapper>
              </div>
            </CardBody>
          </Card>
        </div>
      </main>
    </AppScreen>
  )
}
