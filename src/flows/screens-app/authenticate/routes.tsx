import React from "react"
import { Route } from "react-router-dom"

import { AuthenticateDecider } from "frontend/design-system/templates/authenticate-decider"
import {
  APP_SCREEN_AUTHENTICATE_BASE,
  SUB_PATH_AUTHORIZE_APP,
  SUB_PATH_LOGIN_NFID,
  SUB_PATH_REGISTER_DEVICE_DECIDER,
} from "frontend/flows/screens-app/authenticate/constants"
import { AppScreenRegisterDeviceDecider } from "frontend/flows/screens-app/authenticate/screen-app-register-device-decider"
import { AppScreenAuthorizeApp } from "frontend/screens/authorize-app/app-screen"

import { LoginUnknownDevice } from "./login-unknown-device"
import { PATH_LOGIN_UNKNOWN_DEVICE } from "./login-unknown-device/path"
import { AppScreenNFIDLogin } from "./nfid-login"

export const AppScreenAuthenticateAccountRoutes = (
  <Route
    path={APP_SCREEN_AUTHENTICATE_BASE}
    element={
      <AuthenticateDecider
        rootPath={APP_SCREEN_AUTHENTICATE_BASE}
        loginUnknownDevicePath={`${APP_SCREEN_AUTHENTICATE_BASE}/${PATH_LOGIN_UNKNOWN_DEVICE}`}
        loginNFIDPath={`${APP_SCREEN_AUTHENTICATE_BASE}/${SUB_PATH_LOGIN_NFID}`}
      />
    }
  >
    <Route
      path={SUB_PATH_LOGIN_NFID}
      element={
        <AppScreenNFIDLogin
          unknownDevicePath={`${APP_SCREEN_AUTHENTICATE_BASE}/${PATH_LOGIN_UNKNOWN_DEVICE}`}
          loginSuccessPath={`${APP_SCREEN_AUTHENTICATE_BASE}/${SUB_PATH_AUTHORIZE_APP}`}
        />
      }
    />
    <Route
      path={SUB_PATH_AUTHORIZE_APP}
      element={<AppScreenAuthorizeApp redirectTo="/" />}
    />
    <Route path={PATH_LOGIN_UNKNOWN_DEVICE} element={<LoginUnknownDevice />} />
    <Route
      path={SUB_PATH_REGISTER_DEVICE_DECIDER}
      element={<AppScreenRegisterDeviceDecider />}
    />
  </Route>
)
