import React from "react"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { HiChevronDoubleRight } from "react-icons/hi"
import { Button, Card } from "@identitylabs/ui"
import { CardBody } from "@identitylabs/ui"
import { Divider } from "@identitylabs/ui"
import { H4 } from "@identitylabs/ui"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const HomeScreen: React.FC<Props> = ({ children, className }) => {
  const routes = [
    {
      title: "Common Pages",
      items: [
        "/register",
        "/iframe-overview",
        "/link-internet-identity",
        "/copy-devices",
      ],
    },
    {
      title: "Phone Number Verification Flow",
      items: [
        "/register-identity",
        "/register-identity-name",
        "/register-identity-phone",
        "/register-identity-sms",
        "/register-identity-challenge",
      ],
    },
    {
      title: "Mobile Registration Flow",
      items: [
        "/register-identity-persona-welcome",
        "/register-identity-persona",
        "/register-identity-persona-info",
        "/register-identity-persona-success",
        "/register-identity-persona-createkeys",
        "/register-identity-persona-createkeys-complete",
      ],
    },
  ]

  const getRouteName = (route: string) => {
    return route.replace(/\//g, "").replace(/-/g, " ")
  }

  return (
    <>
      <AppScreen title="Home">
        {process.env.NODE_ENV == "development" && (
          <Card>
            <Button filled>fileld button</Button>
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
                      {routes.items.map((item, index) => (
                        <a
                          className="group hover:border-indigo-500 hover:text-indigo-500 cursor-pointer border rounded flex items-center justify-between p-2 w-full"
                          href={item}
                          key={index}
                        >
                          <span className="capitalize">
                            {getRouteName(item)}
                          </span>
                          <div className="flex">
                            <div className="border-l w-[10px] flex mr-1"></div>
                            <HiChevronDoubleRight className="group-hover:text-indigo-500 text-lg" />
                          </div>
                        </a>
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
