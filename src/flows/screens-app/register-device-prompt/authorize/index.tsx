import React from "react"

import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { Card, CardBody } from "frontend/ui-kit/src/index"

import { AuthorizeAppContent } from "./content"

interface RegisterDevicePromptProps {}

export const RegisterDevicePrompt: React.FC<RegisterDevicePromptProps> = () => {
  return (
    <AppScreen>
      <Card className="grid grid-cols-12">
        <CardBody className="col-span-12 md:col-span-4">
          <AuthorizeAppContent />
        </CardBody>
      </Card>
    </AppScreen>
  )
}
