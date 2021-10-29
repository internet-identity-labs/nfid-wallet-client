import { QRCode } from "frontend/ui-utils/atoms/qrcode";
import React from "react";

export const LoginUnknown: React.FC = () => {
  const SECRET = "WILL_BE_GENERATED"
  const url = `http://localhost:9090/register-device-prompt/${SECRET}`
  return (
    <div className="flex flex-col">
      <div>LoginUnknown</div>
      <QRCode  content={url}/>
      <a className="my-class" href={url} target="_blank">RegisterDevicePrompt</a>
    </div>
  );
};
