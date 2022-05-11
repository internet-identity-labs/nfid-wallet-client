import React from "react"
import { Route } from "react-router-dom"

import { AuthenticateDecider } from "frontend/design-system/templates/authenticate-decider"
import {
  APP_SCREEN_AUTHENTICATE_BASE,
  SUB_PATH_AUTHORIZE_APP,
  SUB_PATH_LOGIN_NFID,
  SUB_PATH_LOGIN_UNKNOWN_DEVICE,
  SUB_PATH_RECOVER_NFID,
  SUB_PATH_REGISTER_DEVICE,
  SUB_PATH_REGISTER_DEVICE_DECIDER,
} from "frontend/flows/screens-app/authenticate/constants"
import { AppScreenRegisterDeviceDecider } from "frontend/flows/screens-app/authenticate/screen-app-register-device-decider"
import { AppScreenAuthorizeAppUnknownDevice } from "frontend/screens/authorize-app-unknown-device/screen-app"
import { AppScreenAuthorizeApp } from "frontend/screens/authorize-app/app-screen"
import { AppScreenRecoverNFID } from "frontend/screens/recover-nfid/screen-app"

import { AppScreenNFIDLogin } from "./login"
import { AppScreenRegisterDevice } from "./screen-app-register-device"

export const AppScreenAuthenticateAccountRoutes = (
  <Route
    path={APP_SCREEN_AUTHENTICATE_BASE}
    element={
      <AuthenticateDecider
        rootPath={APP_SCREEN_AUTHENTICATE_BASE}
        loginUnknownDevicePath={`${APP_SCREEN_AUTHENTICATE_BASE}/${SUB_PATH_LOGIN_UNKNOWN_DEVICE}`}
        loginNFIDPath={`${APP_SCREEN_AUTHENTICATE_BASE}/${SUB_PATH_LOGIN_NFID}`}
        recoverNFIDPath={`${APP_SCREEN_AUTHENTICATE_BASE}/${SUB_PATH_RECOVER_NFID}`}
      />
    }
  >
    <Route
      path={SUB_PATH_LOGIN_NFID}
      element={
        <AppScreenNFIDLogin
          unknownDevicePath={`${APP_SCREEN_AUTHENTICATE_BASE}/${SUB_PATH_LOGIN_UNKNOWN_DEVICE}`}
          loginSuccessPath={`${APP_SCREEN_AUTHENTICATE_BASE}/${SUB_PATH_AUTHORIZE_APP}`}
        />
      }
    />
    <Route
      path={SUB_PATH_AUTHORIZE_APP}
      element={<AppScreenAuthorizeApp redirectTo="/" />}
    />
    <Route
      path={SUB_PATH_LOGIN_UNKNOWN_DEVICE}
      element={
        <AppScreenAuthorizeAppUnknownDevice
          registerDeviceDeciderPath={`${APP_SCREEN_AUTHENTICATE_BASE}/${SUB_PATH_REGISTER_DEVICE_DECIDER}`}
          recoverNFIDPath={`${APP_SCREEN_AUTHENTICATE_BASE}/${SUB_PATH_RECOVER_NFID}`}
        />
      }
    />
    <Route
      path={SUB_PATH_RECOVER_NFID}
      element={
        <AppScreenRecoverNFID
          registerDeviceDeciderPath={`${APP_SCREEN_AUTHENTICATE_BASE}/${SUB_PATH_REGISTER_DEVICE}`}
        />
      }
    />
    <Route
      path={SUB_PATH_REGISTER_DEVICE}
      element={
        <AppScreenRegisterDevice
          registerSuccessPath={`${APP_SCREEN_AUTHENTICATE_BASE}/${SUB_PATH_AUTHORIZE_APP}`}
        />
      }
    />
    <Route
      path={SUB_PATH_REGISTER_DEVICE_DECIDER}
      element={<AppScreenRegisterDeviceDecider />}
    />
  </Route>
)
