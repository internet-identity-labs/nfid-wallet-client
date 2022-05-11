import { Route } from "react-router-dom"

import { AuthenticateDecider } from "frontend/design-system/templates/authenticate-decider"
import { IFrameAuthorizeAppUnknownDevice } from "frontend/screens/authorize-app-unknown-device/screen-iframe"
import { IFrameNFIDLogin } from "frontend/screens/nfid-login/screen-iframe"
import { IFrameRecoverNFID } from "frontend/screens/recover-nfid/screen-iframe"
import { IFrameRegisterDeviceDecider } from "frontend/screens/register-device-decider/screen-iframe"

import {
  IFRAME_AUTHENTICATE_BASE,
  SUB_PATH_AUTHORIZE_APP,
  SUB_PATH_LOGIN_NFID,
  SUB_PATH_LOGIN_UNKNOWN_DEVICE,
  SUB_PATH_RECOVER_NFID,
  SUB_PATH_REGISTER_DEVICE_DECIDER,
} from "./constants"

export const IFrameAuthenticateAccountRoutes = (
  <Route
    path={IFRAME_AUTHENTICATE_BASE}
    element={
      <AuthenticateDecider
        rootPath={IFRAME_AUTHENTICATE_BASE}
        recoverNFIDPath={`${IFRAME_AUTHENTICATE_BASE}/${SUB_PATH_RECOVER_NFID}`}
        loginNFIDPath={`${IFRAME_AUTHENTICATE_BASE}/${SUB_PATH_LOGIN_NFID}`}
        loginUnknownDevicePath={`${IFRAME_AUTHENTICATE_BASE}/${SUB_PATH_LOGIN_UNKNOWN_DEVICE}`}
      />
    }
  >
    <Route
      path={SUB_PATH_LOGIN_NFID}
      element={
        <IFrameNFIDLogin
          unknownDevicePath={`${IFRAME_AUTHENTICATE_BASE}/${SUB_PATH_LOGIN_UNKNOWN_DEVICE}`}
          loginSuccessPath={`${IFRAME_AUTHENTICATE_BASE}/${SUB_PATH_AUTHORIZE_APP}`}
        />
      }
    />
    <Route
      path={SUB_PATH_LOGIN_UNKNOWN_DEVICE}
      element={
        <IFrameAuthorizeAppUnknownDevice
          recoverNFIDPath={`${IFRAME_AUTHENTICATE_BASE}/${SUB_PATH_RECOVER_NFID}`}
          registerDeviceDeciderPath={`${IFRAME_AUTHENTICATE_BASE}/${SUB_PATH_REGISTER_DEVICE_DECIDER}`}
        />
      }
    />
    <Route
      path={SUB_PATH_RECOVER_NFID}
      element={
        <IFrameRecoverNFID
          onRecoverSuccessPath={`${IFRAME_AUTHENTICATE_BASE}/${SUB_PATH_REGISTER_DEVICE_DECIDER}`}
        />
      }
    />
    <Route
      path={SUB_PATH_REGISTER_DEVICE_DECIDER}
      element={
        <IFrameRegisterDeviceDecider
          registerDeviceSuccessPath={`${IFRAME_AUTHENTICATE_BASE}/${SUB_PATH_REGISTER_DEVICE_DECIDER}`}
          loginSuccessPath={`${IFRAME_AUTHENTICATE_BASE}/${SUB_PATH_REGISTER_DEVICE_DECIDER}`}
        />
      }
    />
  </Route>
)
