import { Button, Card, CardBody, CardTitle, Logo } from "@identity-labs/ui"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import React from "react"
import { Link } from "react-router-dom"

interface NotFoundProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const NotFound: React.FC<NotFoundProps> = ({ children, className }) => {
  return (
    <AppScreen isFocused>
      <Card className="flex flex-col h-full">
        <CardTitle className="font-bold">Page Not Found</CardTitle>
        <CardBody className="justify-center">
          <Logo className="max-w-[160px] mx-auto mb-12" />
          <Link to="/" className="flex justify-center">
            <Button block large filled>
              Go back to Home
            </Button>
          </Link>
        </CardBody>
      </Card>
    </AppScreen>
  )
}
