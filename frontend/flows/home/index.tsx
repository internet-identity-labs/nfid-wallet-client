import React from "react"
import clsx from "clsx"
import { AppScreen } from "frontend/ui-utils/templates/AppScreen"
import { HiChevronDoubleRight } from "react-icons/hi"
import { Card } from "frontend/ui-utils/molecules/card"
import { CardBody } from "frontend/ui-utils/molecules/card/body"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const HomeScreen: React.FC<Props> = ({ children, className }) => {
  const routes = [
    "/kitchen-sink",
    "/register",
    "/link-internet-identity",
    "/iframe-overview",
    "/copy-devices",
    "/register-identity",
    "/register-identity-name",
    "/register-identity-phone",
    "/register-identity-sms",
    "/register-identity-challenge",
    "/register-identity-persona-welcome",
    "/register-identity-persona",
    "/register-identity-persona-info",
    "/register-identity-persona-success",
    "/register-identity-persona-createkeys",
    "/register-identity-persona-createkeys-complete",
  ]

  const flowSequences = [
    { title: "register-device-promt", sequence: [{ title: "", route: "/" }] },
  ]

  const getRouteName = (route: string) => {
    return route.replace(/\//g, "").replace(/-/g, " ")
  }

  return (
    <>
      <AppScreen title="Home">
        {process.env.NODE_ENV == "development" && (
          <Card>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {routes.map((item, index) => (
                  <a
                    className="group hover:border-indigo-500 hover:text-indigo-500 cursor-pointer border rounded flex items-center justify-between p-2 w-full"
                    href={item}
                    key={index}
                  >
                    <span className="capitalize">{getRouteName(item)}</span>
                    <div className="flex">
                      <div className="border-l w-[10px] flex mr-1"></div>
                      <HiChevronDoubleRight className="group-hover:text-indigo-500 text-lg" />
                    </div>
                  </a>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </AppScreen>
    </>
  )
}
