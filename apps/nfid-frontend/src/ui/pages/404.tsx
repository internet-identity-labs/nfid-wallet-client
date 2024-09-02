import clsx from "clsx"
import { ButtonAlt } from "packages/ui/src/atoms/button"
import React from "react"
import { useNavigate } from "react-router-dom"

import { AppScreen } from "frontend/ui/templates/app-screen/AppScreen"

import { H2 } from "../atoms/typography"
import { P } from "../atoms/typography/paragraph"
import { Card } from "../molecules/card"

interface NotFoundProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

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

              <ButtonAlt
                large
                stroke
                onClick={() => navigate("/")}
                className="my-4"
              >
                Return to Home
              </ButtonAlt>
            </div>
          </Card>
        </div>
      </main>
    </AppScreen>
  )
}
