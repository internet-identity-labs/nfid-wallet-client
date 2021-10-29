import { Centered } from "frontend/ui-utils/atoms/centered";
import { QRCode } from "frontend/ui-utils/atoms/qrcode";
import React from "react";

const useUnknownDeviceConfig = () => {
  // TODO: create custom hook to load requesting application scope
  const SCOPE = 'DSCVR'
  // TODO: create custom hook to generate secret
  const SECRET = "WILL_BE_GENERATED"
  // TODO: load multipass domain from env
  // requires #6 to be merged
  // env var: `VITE_MULTIPASS_DOMAIN`
  const url = `http://localhost:9090/register-device-prompt/${SECRET}`
  return { url, secred: SECRET, scope: SCOPE }
};

export const UnknownDeviceScreen: React.FC = () => {
  const { url, scope } = useUnknownDeviceConfig()
  return (
    <Centered>
      <div className="font-medium mb-3">Sign in to {scope} with Multipass</div>
      <a href={url} target="_blank">
        <div className="flex flex-row">
          <div className="mr-2">Scan code to login</div>
          <QRCode content={url} options={{ margin: 0 }} />
        </div>
      </a>
    </Centered >
  );
};
