import { Card, CardBody, Divider, H4 } from "@identity-labs/ui"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import React from "react"
import { HiChevronDoubleRight } from "react-icons/hi"
import { Link } from "react-router-dom"
import { AccessPointConstants } from "./add-new-access-point/routes"
import { PhoneNumberVerificationConstants } from "./phone-number-verification/routes"
import { CopyDevicesConstants } from "./prototypes/copy-devices/routes"
import { RegisterConstants } from "./register/routes"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

interface Route {
  path: string
  state?: { [key: string]: any }
}

interface Flow {
  title: string
  base?: string
  items: Route[]
}

export const HomeScreen: React.FC<Props> = ({ children, className }) => {
  const routes: Flow[] = [
    {
      title: "Common Pages",
      base: "",
      items: [{ path: CopyDevicesConstants.base }],
    },
    {
      title: "Mobile Registration Flow",
      base: RegisterConstants.base,
      items: [
        { path: RegisterConstants.welcome },
        { path: RegisterConstants.createPersona },
        {
          path: RegisterConstants.linkInternetIdentity,
          state: { iiDeviceLink: "", userNumber: "" },
        },
        { path: RegisterConstants.linkInternetIdentitySuccess },
        { path: RegisterConstants.finalizePersona },
        {
          path: RegisterConstants.recoveryPhrase,
          state: { recoveryPhrase: "This is not your real recovery phrase" },
        },
      ],
    },
    {
      title: "Add new access point",
      base: AccessPointConstants.base,
      items: [
        { path: AccessPointConstants.copyLinkToChannel },
        { path: AccessPointConstants.awaitingConfirmation },
        { path: `${AccessPointConstants.createKeys}/fake-secret` },
      ],
    },
    {
      title: "Phone Number Verification Flow",
      base: PhoneNumberVerificationConstants.base,
      items: [
        { path: PhoneNumberVerificationConstants.base },
        { path: PhoneNumberVerificationConstants.name },
        { path: PhoneNumberVerificationConstants.phone },
        { path: PhoneNumberVerificationConstants.sms },
        { path: PhoneNumberVerificationConstants.challenge },
      ],
    },
  ]

  const getRouteToText = (route: string, base?: string) => {
    return route.replace(/\//g, " ").replace(/-/g, " ")
  }

  const getFullRoute = (route: string, base?: string) => {
    if (!base || base == route) {
      return route
    }

    return `${base}/${route}`
  }

  return (
    <>
      <AppScreen title="Home">
        {process.env.NODE_ENV == "development" && (
          <Card>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {routes.map((routes, index) => (
                  <div
                    className="col-span-1 sm:col-span-2 md:col-span-1"
                    key={index}
                  >
                    <H4>{routes.title}</H4>
                    <small>{routes.base || "default"}</small>
                    <Divider />
                    <div className="space-y-3">
                      {routes.items.map(({ path, state = {} }, index) => (
                        <Link
                          className="group hover:border-indigo-500 hover:text-indigo-500 cursor-pointer border rounded flex items-center justify-between p-2 w-full"
                          to={getFullRoute(path, routes.base)}
                          key={index}
                          state={state}
                        >
                          <span className="capitalize">
                            {getRouteToText(path)}
                          </span>
                          <div className="flex">
                            <div className="border-l w-[10px] flex mr-1"></div>
                            <HiChevronDoubleRight className="group-hover:text-indigo-500 text-lg" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </AppScreen>
    </>
  )
}
