import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { Button, Card, H2, P } from "frontend/ui-kit/src/index"
import React from "react"
import { useNavigate } from "react-router-dom"

interface NotFoundProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const NotFound: React.FC<NotFoundProps> = ({ children, className }) => {
  const navigate = useNavigate()

  return (
    <AppScreen isFocused>
      <Card className="flex flex-col h-full justify-center items-center text-center">
        <H2 className="capitalize mb-4">Page not found</H2>

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
