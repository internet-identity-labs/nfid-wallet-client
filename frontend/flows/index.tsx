import { Card, CardBody, Divider, H4 } from "@identity-labs/ui"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import React from "react"
import { HiChevronDoubleRight } from "react-icons/hi"
import { Link } from "react-router-dom"

interface Route {
  path: string
  state?: { [key: string]: any }
}

interface Flow {
  title: string
  items: Route[]
}

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const HomeScreen: React.FC<Props> = ({ children, className }) => {
  const routes: Flow[] = [
    {
      title: "Common Pages",
      items: [{ path: "/copy-devices" }],
    },
    {
      title: "Mobile Registration Flow",
      items: [
        { path: "/register/welcome" },
        { path: "/register/create-persona" },
        {
          path: "/register/link-internet-identity",
          state: { iiDeviceLink: "", userNumber: "" },
        },
        { path: "/register/link-internet-identity-success" },
        { path: "/register/finalize-persona" },
        {
          path: "/register/recovery-phrase",
          state: { recoveryPhrase: "This is not your real recovery phrase" },
        },
      ],
    },
    {
      title: "Add new access point",
      items: [
        { path: "/new-access-point/copy-link-to-channel" },
        { path: "/new-access-point/awaiting-confirmation" },
        { path: "/new-access-point/create-keys" },
      ],
    },
    {
      title: "Phone Number Verification Flow",
      items: [
        { path: "/register-identity" },
        { path: "/register-identity-name" },
        { path: "/register-identity-phone" },
        { path: "/register-identity-sms" },
        { path: "/register-identity-challenge" },
      ],
    },
  ]

  const getRouteName = (route: string) => {
    return route.replace(/\//g, " ").replace(/-/g, " ")
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
                    <Divider />
                    <div className="space-y-3">
                      {routes.items.map(({ path, state = {} }, index) => (
                        <Link
                          className="group hover:border-indigo-500 hover:text-indigo-500 cursor-pointer border rounded flex items-center justify-between p-2 w-full"
                          to={path}
                          key={index}
                          state={state}
                        >
                          <span className="capitalize">
                            {getRouteName(path)}
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
