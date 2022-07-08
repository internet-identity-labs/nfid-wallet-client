import React from "react"
import { Route } from "react-router-dom"

import { AuthenticateRegisterDecider } from "frontend/design-system/templates/authenticate-register-decider"

import {
  APP_SCREEN_AUTHENTICATE_BASE,
  SUB_PATH_AUTHORIZE_APP,
  SUB_PATH_AUTHORIZE_DECIDER,
  SUB_PATH_LOGIN_NFID,
  SUB_PATH_REGISTER_DEVICE_DECIDER,
} from "frontend/apps/authentication/authenticate/constants"
import { AppScreenRegisterDeviceDecider } from "frontend/apps/authentication/authenticate/screen-app-register-device-decider"

import { ProfileConstants } from "../../identity-manager/profile/routes"
import { AppScreenAuthorizeApp } from "./authorize-app"
import { AppScreenAuthorizeDecider } from "./authorize-decider"
import { RouteCaptcha } from "./captcha"
import { PATH_CAPTCHA } from "./captcha/path"
import { LoginUnknownDevice } from "./login-unknown-device"
import { PATH_LOGIN_UNKNOWN_DEVICE } from "./login-unknown-device/path"
import { AppScreenNFIDLogin } from "./nfid-login"
import { RouteRegister } from "./register"
import { PATH_REGISTER } from "./register/path"

export const AppScreenAuthenticateAccountRoutes = (
  <Route
    path={APP_SCREEN_AUTHENTICATE_BASE}
    element={
      <AuthenticateRegisterDecider
        rootPath={APP_SCREEN_AUTHENTICATE_BASE}
        unknownDevicePath={`${APP_SCREEN_AUTHENTICATE_BASE}/${SUB_PATH_AUTHORIZE_DECIDER}`}
        registeredDevicePath={`${APP_SCREEN_AUTHENTICATE_BASE}/${SUB_PATH_AUTHORIZE_APP}`}
      />
    }
  >
    <Route
      path={SUB_PATH_AUTHORIZE_DECIDER}
      element={
        <AppScreenAuthorizeDecider
          pathRegisterSameDevice={`${APP_SCREEN_AUTHENTICATE_BASE}/${PATH_REGISTER}`}
          pathRemoteAuthorization={`${APP_SCREEN_AUTHENTICATE_BASE}/${PATH_LOGIN_UNKNOWN_DEVICE}`}
          pathAuthorizeApp={`${APP_SCREEN_AUTHENTICATE_BASE}/${SUB_PATH_AUTHORIZE_APP}`}
          pathCaptcha={`${APP_SCREEN_AUTHENTICATE_BASE}/${PATH_CAPTCHA}`}
        />
      }
    />
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
    <Route
      path={PATH_LOGIN_UNKNOWN_DEVICE}
      element={
        <LoginUnknownDevice
          registerSameDevicePath={`${APP_SCREEN_AUTHENTICATE_BASE}/${PATH_REGISTER}`}
        />
      }
    />
    <Route
      path={SUB_PATH_REGISTER_DEVICE_DECIDER}
      element={<AppScreenRegisterDeviceDecider />}
    />
    <Route
      path={PATH_REGISTER}
      element={
        <RouteRegister
          captchaPath={`${APP_SCREEN_AUTHENTICATE_BASE}/${PATH_CAPTCHA}`}
          pathAuthorizeApp={`${APP_SCREEN_AUTHENTICATE_BASE}/${SUB_PATH_AUTHORIZE_APP}`}
        />
      }
    />
    <Route
      path={PATH_CAPTCHA}
      element={<RouteCaptcha successPath={`${ProfileConstants.base}`} />}
    />
  </Route>
)
