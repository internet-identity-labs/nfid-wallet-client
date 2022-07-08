import { Button, Card, H2, P } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"
import { useNavigate } from "react-router-dom"

import { AppScreen } from "frontend/design-system/templates/app-screen/AppScreen"

interface NotFoundProps
  extends React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
  > { }

export const NotFound: React.FC<NotFoundProps> = ({ children, className }) => {
  const navigate = useNavigate()

  return (
    <AppScreen isFocused>
      <main className={clsx("flex flex-1")}>
        <div className="container px-6 py-0 mx-auto sm:py-4">
          <Card className="flex flex-col items-center justify-center h-full text-center">
            <H2 className="mb-4 capitalize">Page not found</H2>

            <div>
              <P>The page you are looking for does not exist.</P>

              <Button
                large
                stroke
                onClick={() => navigate("/")}
                className="my-4"
              >
                Return to Home
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </AppScreen>
  )
}
