import textEncoding = require("text-encoding");

declare global {

  namespace WebdriverIO {

    interface Browser {
      addVirtualWebAuth: (
        protocol: "ctap2",
        transport: "usb",
        hasResidentKey: true,
        isUserConsenting: true,
      ) => Promise<string>;
      removeVirtualWebAuth: (authenticatorId: string) => Promise<void>;
    }
  }
}

global.TextEncoder = textEncoding.TextEncoder;
