import textEncoding = require("text-encoding");

declare global {

  namespace WebdriverIO {

    interface Browser {
      addVirtualWebAuth: (
        protocol: string,
        transport: string,
        hasResidentKey: boolean,
        isUserConsenting: boolean,
      ) => Promise<string>;
      removeVirtualWebAuth: (authenticatorId: string) => Promise<void>;
    }
  }
}

global.TextEncoder = textEncoding.TextEncoder

