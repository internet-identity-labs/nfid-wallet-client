import { Route } from "react-router-dom"

import { AuthenticateDecider } from "frontend/design-system/templates/authenticate-decider"
import { IFrameNFIDLogin } from "frontend/screens/nfid-login/screen-iframe"
import { IFrameRegisterDeviceDecider } from "frontend/screens/register-device-decider/screen-iframe"

import {
  IFRAME_AUTHENTICATE_BASE,
  SUB_PATH_AUTHORIZE_APP,
  SUB_PATH_LOGIN_NFID,
  SUB_PATH_REGISTER_DEVICE_DECIDER,
} from "./constants"
import { LoginUnknownDevice } from "./login-unknown-device"
import { PATH_LOGIN_UNKNOWN_DEVICE } from "./login-unknown-device/path"

export const IFrameAuthenticateAccountRoutes = (
  <Route
    path={IFRAME_AUTHENTICATE_BASE}
    element={
      <AuthenticateDecider
        rootPath={IFRAME_AUTHENTICATE_BASE}
        loginNFIDPath={`${IFRAME_AUTHENTICATE_BASE}/${SUB_PATH_LOGIN_NFID}`}
        loginUnknownDevicePath={`${IFRAME_AUTHENTICATE_BASE}/${PATH_LOGIN_UNKNOWN_DEVICE}`}
      />
    }
  >
    <Route
      path={SUB_PATH_LOGIN_NFID}
      element={
        <IFrameNFIDLogin
          unknownDevicePath={`${IFRAME_AUTHENTICATE_BASE}/${PATH_LOGIN_UNKNOWN_DEVICE}`}
          loginSuccessPath={`${IFRAME_AUTHENTICATE_BASE}/${SUB_PATH_AUTHORIZE_APP}`}
        />
      }
    />
    <Route path={PATH_LOGIN_UNKNOWN_DEVICE} element={<LoginUnknownDevice />} />
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
