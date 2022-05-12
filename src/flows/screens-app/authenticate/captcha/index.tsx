import React from "react"

import { Captcha } from "frontend/screens/captcha"

interface RouteCaptchaProps {
  successPath: string
}

export const RouteCaptcha: React.FC<RouteCaptchaProps> = ({ successPath }) => (
  <Captcha successPath={successPath} />
)
