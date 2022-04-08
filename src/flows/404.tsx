import { Button, Card, H2, P } from "@internet-identity-labs/nfid-sdk-react"
import React from "react"
import { useNavigate } from "react-router-dom"

import { AppScreen } from "frontend/design-system/templates/AppScreen"

interface NotFoundProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const NotFound: React.FC<NotFoundProps> = ({ children, className }) => {
  const navigate = useNavigate()

  return (
    <AppScreen isFocused>
      <Card className="flex flex-col items-center justify-center h-full text-center">
        <H2 className="mb-4 capitalize">Page not found</H2>

        <div>
          <P>The page you are looking for does not exist.</P>

          <Button large stroke onClick={() => navigate("/")} className="my-4">
            Return to Home
          </Button>
        </div>
      </Card>
    </AppScreen>
  )
}
