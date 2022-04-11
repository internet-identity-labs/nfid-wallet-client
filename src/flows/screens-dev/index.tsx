import {
  Card,
  CardBody,
  Divider,
  H4,
} from "@internet-identity-labs/nfid-sdk-react"
import React from "react"
import { HiChevronDoubleRight } from "react-icons/hi"
import { Link } from "react-router-dom"

import { AppScreen } from "frontend/design-system/templates/AppScreen"

import { AccessPointConstants } from "../prototypes/add-new-access-point/routes"
import { CopyDevicesConstants } from "../prototypes/copy-devices/routes"
import { LinkIIAnchorConstants } from "../screens-app/link-ii-anchor/routes"
import { ProfileConstants } from "../screens-app/profile/routes"
import { RegisterAccountConstants } from "../screens-app/register-account/routes"
import { DevScreensConstants } from "./routes"

interface DevHomeScreenProps
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

export const DevHomeScreen: React.FC<DevHomeScreenProps> = ({
  children,
  className,
}) => {
  const routes: Flow[] = [
    {
      title: "Dev Screens",
      base: DevScreensConstants.base,
      items: [
        {
          path: DevScreensConstants.kitchenSink,
        },
        {
          path: DevScreensConstants.iframeOverview,
        },
      ],
    },
    {
      title: "Common Pages",
      base: "",
      items: [{ path: CopyDevicesConstants.base }],
    },
    {
      title: "Profile",
      base: ProfileConstants.base,
      items: [
        { path: `${ProfileConstants.authenticate}` },
        {
          path: `${ProfileConstants.personalize}`,
        },
      ],
    },
    {
      title: "Register Account (NFID) Flow",
      base: RegisterAccountConstants.base,
      items: [
        { path: RegisterAccountConstants.account },
        { path: RegisterAccountConstants.captcha },
        {
          path: RegisterAccountConstants.copyRecoveryPhrase,
        },
      ],
    },
    {
      title: "Link II Anchor Flow",
      base: LinkIIAnchorConstants.base,
      items: [
        { path: LinkIIAnchorConstants.linkIIAnchor },
        {
          path: LinkIIAnchorConstants.keys,
          state: { iiDeviceLink: "", userNumber: "" },
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
  ]

  const getRouteToText = (route: string, base?: string) => {
    return route.replace(/\//g, " ").replace(/-/g, " ")
  }

  const getFullRoute = (route: string, base?: string) => {
    if (!base || base === route) {
      return route
    }

    return `${base}/${route}`
  }

  return (
    <AppScreen
      bubbleOptions={{
        showBubbles: false,
      }}
    >
      {process.env.NODE_ENV === "development" && (
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                        className="flex items-center justify-between w-full p-2 border rounded cursor-pointer group hover:border-indigo-500 hover:text-indigo-500"
                        to={getFullRoute(path, routes.base)}
                        key={index}
                        state={state}
                      >
                        <span className="first-letter:capitalize">
                          {getRouteToText(path)}
                        </span>
                        <div className="flex">
                          <div className="border-l w-[10px] flex mr-1"></div>
                          <HiChevronDoubleRight className="text-lg group-hover:text-indigo-500" />
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
  )
}
