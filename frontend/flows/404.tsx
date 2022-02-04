import {
  Button,
  Card,
  CardBody,
  CardTitle,
  H1,
  Logo,
} from "frontend/ui-kit/src/index"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import React from "react"
import { Link, useNavigate } from "react-router-dom"

interface NotFoundProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const NotFound: React.FC<NotFoundProps> = ({ children, className }) => {
  const navigate = useNavigate()

  return (
    <AppScreen isFocused>
      <Card className="flex flex-col h-full">
        <CardBody className="justify-center text-center items-center">
          <H1 className="mb-12">Page not found</H1>

          <Logo className="max-w-[160px] mx-auto mb-12" />
          <Button large filled onClick={() => navigate("/")}>
            Return to Home
          </Button>
        </CardBody>
      </Card>
    </AppScreen>
  )
}
