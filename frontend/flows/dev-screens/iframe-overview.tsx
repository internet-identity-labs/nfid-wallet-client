import clsx from "clsx"
import { IFrameWrapper } from "components/molecules/iframe/wrapper"
import { InputSelect } from "frontend/design-system/molecules/inputs/select"
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
  P,
} from "frontend/ui-kit/src"
import React from "react"
import { AuthorizeRegisterDecider } from "../iframes/login-unknown/authorize-register-decider"

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
              <IFrameScreen logo>
                <H5 className="mb-4 text-center">Unlock your NFID</H5>

                <P className="text-center pb-12">
                  The NFID on this device can only be unlocked by {accountName}.
                </P>

                <Button secondary block>
                  Unlock as {accountName}
                </Button>
                <Button text block>
                  Log in as different person
                </Button>
              </IFrameScreen>
            </IFrameWrapper>

            {/* IFrameAuthorizeApp */}
            <IFrameWrapper
              className="inset-0 col-span-12 md:col-span-6 xl:col-span-4 relative"
              fixedHeight={false}
            >
              <IFrameScreen logo>
                <H5 className="mb-4 text-center">
                  Log in to {applicationName}
                </H5>

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
              <AuthorizeRegisterDecider
                onRegister={() => console.log("onRegister")}
                onLogin={() => console.log("onLogin")}
              />
            </IFrameWrapper>
          </div>
        </CardBody>
      </Card>
    </AppScreen>
  )
}
